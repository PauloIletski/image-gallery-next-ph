import '@/styles/index.css'
import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: 'Issacar Pictures Beta¹',
    description: 'Galeria de fotos da Issacar Church',
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-BR" className="dark">
            <body className={`${inter.className} bg-black text-white antialiased`}>
                {children}
                <Analytics />
            </body>
        </html>
    )
}