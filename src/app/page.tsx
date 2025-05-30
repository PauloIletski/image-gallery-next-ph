import Link from 'next/link'
import { getGalleryPaths } from '@/lib/get-gallery-images'
import Logo from '@/components/Icons/Logo'
import Image from 'next/image'
import type { GalleryFolder } from '@/lib/get-gallery-images'

export const revalidate = 60

function capitalizeTitle(text: string): string {
    return text
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

export default async function HomePage() {
    const folders = await getGalleryPaths()

    return (
        <main className="mx-auto max-w-[1960px] p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                <div className="relative col-span-1 row-span-1 flex flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 p-6 text-center text-white shadow-highlight sm:col-span-2 sm:p-8 md:aspect-[2.4/1] md:row-span-1">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/0"></div>
                    </div>
                    <Logo className="relative w-28 drop-shadow-xl" />
                    <h1 className="relative mt-4 text-2xl font-bold uppercase tracking-widest drop-shadow-lg">
                        Issacar Pictures Beta²
                    </h1>
                    <p className="relative mt-2 max-w-[40ch] text-white/75 drop-shadow-lg sm:max-w-[32ch]">
                        Bem-vindo à galeria de fotos da Issacar Church. Selecione um álbum abaixo para ver as fotos.
                    </p>
                    <Link
                        className="relative mt-4 rounded-lg border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-6"
                        href="https://issacar.deco.site"
                    >
                        Voltar ao site
                    </Link>
                </div>

                {folders.map((folder: GalleryFolder) => (
                    <Link
                        key={folder.slug}
                        href={`/issacar-galeries/${folder.slug}`}
                        className="group relative block aspect-square overflow-hidden rounded-lg bg-gray-100 shadow-highlight"
                    >
                        <div className="absolute inset-0">
                            {folder.thumbnail ? (
                                <Image
                                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_thumb,w_400,h_400/${folder.thumbnail.public_id}.${folder.thumbnail.format}`}
                                    className="h-full w-full transform object-cover brightness-90 transition will-change-auto group-hover:brightness-110"
                                    style={{ transform: 'translate3d(0, 0, 0)' }}
                                    placeholder="blur"
                                    blurDataURL={folder.thumbnail.blurDataUrl}
                                    alt={capitalizeTitle(folder.slug)}
                                    width={400}
                                    height={400}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <h2 className="text-2xl font-bold text-gray-900">{capitalizeTitle(folder.slug)}</h2>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute inset-0 flex items-end justify-center p-4">
                                <h2 className="text-center text-lg font-bold text-white drop-shadow-lg">
                                    {capitalizeTitle(folder.slug)}
                                </h2>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <footer className="mt-8 p-6 text-center text-white/80 sm:p-12">
                <a href="https://issacar.deco.site" className="hover:text-white">Issacar Church</a> &copy; {new Date().getFullYear()}
            </footer>
        </main>
    )
} 