import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Issacar Church Imagens - Galeria',
    description: 'Visualização de galeria'
}

export default function GalleryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <main className="mx-auto max-w-[1960px] p-4">
            {children}
        </main>
    )
} 