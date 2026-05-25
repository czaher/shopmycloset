'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Item } from '@/lib/types'
import { parseImages } from '@/lib/types'

const CATEGORIES = [
  'All',
  'T-Shirts',
  'Long-Sleeves',
  'Sweaters',
  'Sweatshirts',
  'Pants',
  'Coats',
  'Shoes',
  'Other',
]

export default function StoreFront({ items }: { items: Item[] }) {
  const [category, setCategory] = useState('All')
  const [availableOnly, setAvailableOnly] = useState(false)

  const filtered = items.filter((item) => {
    if (availableOnly && item.status !== 'available') return false
    if (category !== 'All' && item.category !== category) return false
    return true
  })

  return (
    <div>
      {/* Filters */}
      <div className='flex flex-col gap-3 mb-8'>
        {/* Category pills */}
        <div className='flex flex-wrap gap-2'>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
                category === c
                  ? 'bg-terra text-cream border-terra'
                  : 'border-warm-beige text-muted-brown hover:border-terra hover:text-terra'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Available toggle */}
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setAvailableOnly((v) => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              availableOnly ? 'bg-terra' : 'bg-warm-beige'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                availableOnly ? 'translate-x-[18px]' : 'translate-x-1'
              }`}
            />
          </button>
          <span className='text-sm text-muted-brown'>Available only</span>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className='text-center text-muted-brown py-16 font-serif text-lg'>
          Nothing here for that filter.
        </p>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5'>
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

function ItemCard({ item }: { item: Item }) {
  const isReserved = item.status === 'reserved'
  const images = parseImages(item.image_path)

  return (
    <Link
      href={`/item/${item.id}`}
      className={`group block rounded-2xl overflow-hidden bg-white border border-warm-beige transition-shadow hover:shadow-md ${isReserved ? 'opacity-70' : ''}`}
    >
      <div className='relative aspect-[3/4] bg-warm-beige overflow-hidden'>
        {images[0] ? (
          <Image
            src={images[0]}
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
        {images.length > 1 && !isReserved && (
          <span className='absolute top-2 right-2 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded-full'>
            {images.length}
          </span>
        )}
        {isReserved && (
          <div className='absolute inset-0 bg-warm-brown/30 flex items-center justify-center'>
            <span className='bg-warm-brown text-cream text-xs font-medium px-3 py-1 rounded-full tracking-widest uppercase'>
              Reserved
            </span>
          </div>
        )}
      </div>

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
