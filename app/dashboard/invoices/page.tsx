import React from 'react'
import Pagination from '@/app/ui/invoices/pagination'
import Search from '@/app/ui/search'
import Table from '@/app/ui/invoices/table'
import { CreateInvoice } from '@/app/ui/invoices/buttons'
import { lusitana } from '@/app/ui/fonts'
import { InvoicesTableSkeleton } from '@/app/ui/skeletons'
import { Suspense } from 'react'
import { fetchInvoicesPages } from '@/app/lib/data'

const Invoices = async ({
  searchParams
}: {
  searchParams?: {
    query?: string;
    page?: string;
  }
}) => {

  //   <Search> is a Client Component, so you used the useSearchParams() hook to access the params from the client.
  // <Table> is a Server Component that fetches its own data, so you can pass the searchParams prop from the page to the component.
  // As a general rule, if you want to read the params from the client, use the useSearchParams() hook as this avoids having to go back to the server.

  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  // fetchInvoicesPages returns the total number of pages based on the search query. For example, if there are 12 invoices that match the search query, and each page displays 6 invoices, then the total number of pages would be 2.
  const totalPages = await fetchInvoicesPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>
          Invoices
        </h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>
       <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  )
}

export default Invoices