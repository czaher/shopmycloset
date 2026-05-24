import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "corey's clothes",
  description: 'these clothes are mine but could be yours.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <head />
      <body className='min-h-screen bg-cream'>{children}</body>
    </html>
  )
}
