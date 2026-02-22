import Link from 'next/link'
import { getGalleryPaths } from '@/lib/get-gallery-images'
import Logo from '@/components/Icons/Logo'
import Image from 'next/image'
import Footer from '@/components/Footer'
import type { GalleryFolder } from '@/lib/get-gallery-images'

export const revalidate = 60

function capitalizeTitle(text: string): string {
    return text
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date)
}

export default async function HomePage() {
    const folders = await getGalleryPaths()

    return (
        <main className="mx-auto max-w-[1960px] p-4 pb-20 md:pb-0">
            <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
                <div className="after:content relative mb-5 flex h-[629px] flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <span className="absolute left-0 right-0 bottom-0 h-[400px] bg-gradient-to-b from-black/0 via-black to-black"></span>
                    </div>
                    <Logo className="relative w-28 drop-shadow-xl" />
                    <h1 className="text-base font-bold uppercase tracking-widest">
                        Issacar Imagens
                    </h1>
                    <p className="max-w-[40ch] text-white/75 sm:max-w-[32ch]">
                        Bem-vindo à galeria de fotos da Issacar Church. Selecione um álbum abaixo para ver as fotos.
                    </p>
                    <Link
                        className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-4"
                        href="https://issacar.deco.site"
                    >
                        Voltar ao site
                    </Link>
                    <Link
                        className="pointer z-10 mt-2 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-2"
                        href="/policies"
                    >
                        Políticas de Privacidade
                    </Link>
                </div>

                {folders.map((folder: GalleryFolder) => (
                    <Link
                        key={folder.slug}
                        href={`/issacar-galeries/${folder.slug}`}
                        className="group relative mb-5 block aspect-square overflow-hidden rounded-lg bg-white/10 shadow-highlight"
                    >
                        <div className="absolute inset-0">
                            {folder.thumbnail ? (
                                <Image
                                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_720,h_720/${folder.thumbnail.public_id}.${folder.thumbnail.format}`}
                                    className="h-full w-full transform object-cover brightness-90 transition will-change-auto group-hover:brightness-110"
                                    style={{ transform: 'translate3d(0, 0, 0)' }}
                                    placeholder="blur"
                                    blurDataURL={folder.thumbnail.blurDataUrl}
                                    alt={capitalizeTitle(folder.slug)}
                                    width={720}
                                    height={720}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                        <h2 className="text-2xl font-bold text-white">{capitalizeTitle(folder.slug)}</h2>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute inset-0 flex flex-col items-end justify-end p-4">
                                <h2 className="w-full text-center text-lg font-bold text-white drop-shadow-lg mb-1">
                                    {capitalizeTitle(folder.slug)}
                                </h2>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <Footer />
        </main>
    )
} 