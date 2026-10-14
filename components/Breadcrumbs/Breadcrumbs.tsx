import Link from 'next/link'
import { Fragment } from 'react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

// Graue Leiste unter dem Seitenkopf. Der letzte Eintrag ist die aktuelle Seite.
export default function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <div data-breadcrumbs className="sticky top-24 z-30 w-full bg-gray-100">
      <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-7xl px-6 py-3 lg:px-8">
        <ol className="flex items-center gap-2 text-sm text-gray-600">
          {items.map((item, index) => (
            <Fragment key={item.name}>
              {index > 0 && (
                <li aria-hidden="true">
                  <ChevronRightIcon className="size-4" />
                </li>
              )}
              {item.href ? (
                <li>
                  <Link href={item.href} className="hover:text-black">
                    {item.name}
                  </Link>
                </li>
              ) : (
                <li aria-current="page" className="truncate font-semibold text-black">
                  {item.name}
                </li>
              )}
            </Fragment>
          ))}
        </ol>
      </nav>
    </div>
  )
}
