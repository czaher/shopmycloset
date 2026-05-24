import Link from 'next/link'
import Image from 'next/image'
import { db, type Item } from '@/lib/db'

export const dynamic = 'force-dynamic'

const CATEGORIES = [
  'All',
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Accessories',
  'Other',
]

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string }>
}) {
  // searchParams is a promise in Next.js 15 — but for server components we can use it directly
  // We'll handle filtering via URL params on client side via a thin wrapper
  const items = db()
    .prepare('SELECT * FROM items ORDER BY created_at DESC')
    .all() as Item[]

  const availableCount = items.filter((i) => i.status === 'available').length

  return (
    <div className='min-h-screen bg-cream'>
      {/* Header */}
      <header className='border-b border-warm-beige bg-cream sticky top-0 z-10'>
        <div className='max-w-5xl mx-auto px-6 py-5 flex items-center justify-between'>
          <div>
            <p className='text-sm text-muted-brown mt-0.5'>
              {availableCount} {availableCount === 1 ? 'piece' : 'pieces'}{' '}
              available — pls take something
            </p>
          </div>
          <span className='text-xs text-muted-brown hidden sm:block italic'>
            free to a swaggy home
          </span>
        </div>
      </header>

      <main className='max-w-5xl mx-auto px-6 py-10'>
        {items.length === 0 ? (
          <div className='text-center py-24'>
            <p className='font-serif text-xl text-muted-brown'>
              nothing here...
            </p>
          </div>
        ) : (
          <StoreFront items={items} />
        )}
      </main>
    </div>
  )
}

function StoreFront({ items }: { items: Item[] }) {
  return (
    <div>
      {/* Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5'>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

function ItemCard({ item }: { item: Item }) {
  const isReserved = item.status === 'reserved'

  return (
    <Link
      href={`/item/${item.id}`}
      className={`group block rounded-2xl overflow-hidden bg-white border border-warm-beige transition-shadow hover:shadow-md ${isReserved ? 'opacity-70' : ''}`}
    >
      {/* Image */}
      <div className='relative aspect-[3/4] bg-warm-beige overflow-hidden'>
        {item.image_path ? (
          <Image
            src={item.image_path}
            alt={item.name}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
          />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center text-muted-brown text-4xl'>
            🧥
          </div>
        )}
        {isReserved && (
          <div className='absolute inset-0 bg-warm-brown/30 flex items-center justify-center'>
            <span className='bg-warm-brown text-cream text-xs font-medium px-3 py-1 rounded-full tracking-widest uppercase'>
              Reserved
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className='p-3'>
        <p className='font-medium text-warm-brown text-sm leading-snug truncate'>
          {item.name}
        </p>
        <div className='flex items-center gap-2 mt-1'>
          {item.size && (
            <span className='text-xs text-muted-brown bg-warm-beige px-2 py-0.5 rounded-full'>
              {item.size}
            </span>
          )}
          {item.category && (
            <span className='text-xs text-muted-brown'>{item.category}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
