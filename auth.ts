import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

// create a new getUser function that queries the user from the database.
async function getUser(email: string) : Promise<User | undefined> {
    try {
        const user = await sql<User> `SELECT * FROM users WHERE email=${email}`;
        return user.rows[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {

                // use zod for type test
                const parsedCredentials = z
                .object({ email: z.string().email(), password: z.string().min(6) })
                .safeParse(credentials);

                // check if parsed credentials pass the type test and run some logic
                if (parsedCredentials.success) {
                    // destructure parsed credentials
                    const { email, password } = parsedCredentials.data;
                    
                    // assign user vars to the return result from getUser function
                    const user = await getUser(email);
                    if(!user) return null;

                    // Then, call bcrypt.compare to check if the passwords match:
                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    // return user if passwords match
                    if (passwordsMatch) return user;
                }

                console.log('invalid credentials');
                // return null to prevent the user from logging in.
                return null;
            },
        }),
    ],
});