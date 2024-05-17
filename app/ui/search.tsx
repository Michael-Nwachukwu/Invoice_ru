'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

// For search funtionality. Create a handleSearch function and link the onChange listenere to the function

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  //   Here's a breakdown of what's happening:
  // ${pathname} is the current path, in your case, "/dashboard/invoices".
  // As the user types into the search bar, params.toString() translates this input into a URL-friendly format.
  // replace(${pathname}?${params.toString()}) updates the URL with the user's search data. For example, /dashboard/invoices?query=lee if the user searches for "Lee".
  // The URL is updated without reloading the page, thanks to Next.js's client-side navigation (which you learned about in the chapter on navigating between pages.

  const handleSearch = useDebouncedCallback((term: string) => {
    console.log(term);
    // URLSearchParams is a Web API that provides utility methods for manipulating the URL query parameters. Instead of creating a complex string literal, you can use it to get the params string like ?page=1&query=a.
    const params = new URLSearchParams(searchParams);

    // Next, set the params string based on the user’s input. If the input is empty, you want to delete it
    if(term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    // Import useRouter and usePathname from 'next/navigation', and use the replace method from useRouter() inside handleSearch:
    replace(`${pathname}?${params.toString()}`);
  }, 300)

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        // To ensure the input field is in sync with the URL and will be populated when sharing, you can pass a defaultValue to input by reading from searchParams: if you're using state to manage the value of an input, you'd use the value attribute to make it a controlled component. This means React would manage the input's state. However, since you're not using state, you can use defaultValue. This means the native input will manage its own state. This is okay since you're saving the search query to the URL instead of state.
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
