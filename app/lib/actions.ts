// By adding the 'use server', you mark all the exported functions within the file as server functions. These server functions can then be imported into Client and Server components, making them extremely versatile.
'use server';
import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


// This schema will validate the formData before saving it to a database.
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
})

// ========================== UPDATE INVOICE =======================
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    // Type validation and coercions to ensure the db details inserted are of the same type
    // grab the data from the formData and input in an object ready to be handled
    const {customerId, amount, status} = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // Let's convert the amount into cents. It's usually good practice to store monetary values in cents in your database to eliminate JavaScript floating-point errors and ensure greater accuracy.
    const amountInCents = amount * 100;

    // create new date
    const date = new Date().toISOString().split('T')[0];

    // Inserting the data into your database and catching errors
    try {
        await sql`
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }

    // revalidate cache path to fetch fresh data after data is inserted
    revalidatePath('/dashboard/invoices');

    // redirect user to the invoice page
    redirect('/dashboard/invoices');

    // Note how redirect is being called outside of the try/catch block. This is because redirect works by throwing an error, which would be caught by the catch block. To avoid this, you can call redirect after try/catch. redirect would only be reachable if try is successful.
}


// ========================== UPDATE INVOICE =======================
const UpdateInvoice = FormSchema.omit({id: true, date:true});

export async function updateInvoice(id: string, formData: FormData) {

    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
     
    const amountInCents = amount * 100;
    
    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Update Invoice.',
        };
    }
    
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}


// ========================== UPDATE INVOICE =======================
export async function deleteInvoice(id: string) {
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return { message: 'Deleted Invoice.' };
    } catch (error) {
        return {
            message: 'Database Error: Failed to Delet Invoice.',
        };   
    }
}