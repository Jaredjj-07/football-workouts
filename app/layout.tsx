import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Football Workouts',
  description: 'Track team workouts and points',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}