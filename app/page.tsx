import { db, type Item } from '@/lib/db'
import StoreFront from './StoreFront'

export const dynamic = 'force-dynamic'

export default function Home() {
  const items = db()
    .prepare('SELECT * FROM items ORDER BY created_at DESC')
    .all() as Item[]

  const availableCount = items.filter((i) => i.status === 'available').length

  return (
    <div className='min-h-screen bg-cream'>
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
