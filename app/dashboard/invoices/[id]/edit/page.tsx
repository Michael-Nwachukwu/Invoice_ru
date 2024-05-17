import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

// In addition to searchParams, page components also accept a prop called params which you can use to access the id. Update your <Page> component to receive the prop:
export default async function Page({ params }: { params: {  id: string} }) {

    // declare current id
    const id = params.id;
    
    // You can use Promise.all to fetch both the invoice and customers in parallel:
    const [invoice, customers] = await Promise.all([
        fetchInvoiceById(id),
        fetchCustomers(),
    ]);

    if(!invoice) {
        notFound()
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                { label: 'Invoices', href: '/dashboard/invoices' },
                {
                    label: 'Edit Invoice',
                    href: `/dashboard/invoices/${id}/edit`,
                    active: true,
                },
                ]}
            />
            <Form invoice={invoice} customers={customers} />
        </main>
    );
}