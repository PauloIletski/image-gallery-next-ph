import Link from 'next/link'
import { getGalleryImages, getGalleryPaths, type GalleryFolder } from '@/lib/get-gallery-images'
import Logo from '@/components/Icons/Logo'
import { notFound } from 'next/navigation'
import GalleryImage from '@/components/GalleryImage'
import ImageGalleryInline from '@/components/ImageGalleryInline'
import GalleryModalWrapper from '@/components/GalleryModalWrapper'

type PageProps = {
    params: { slug: string }
    searchParams: { photoId?: string }
}

// Gera os caminhos estáticos para todas as galerias
export async function generateStaticParams() {
    try {
        const folders = await getGalleryPaths()
        return folders.map((folder: GalleryFolder) => ({
            slug: folder.slug
        }))
    } catch (error) {
        console.error('Erro ao gerar parâmetros estáticos:', error)
        return []
    }
}

export const revalidate = 60

export default async function GalleryPage({ params }: PageProps) {
    if (!params?.slug) {
        console.error('Slug não fornecido')
        return notFound()
    }

    try {
        const slug = params.slug

        // Primeiro, verifica se a pasta existe
        const folders = await getGalleryPaths()
        const isValidSlug = folders.some(folder => folder.slug === slug)

        if (!isValidSlug) {
            console.error(`Pasta não encontrada: ${slug}`)
            return notFound()
        }

        // Depois, busca as imagens
        const { images } = await getGalleryImages(slug)

        if (!images || images.length === 0) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center">
                    <Logo className="relative mb-8 w-28 drop-shadow-xl" />
                    <p className="text-center text-xl text-white/75">
                        Ops: não foi possível carregar as imagens no momento, tente novamente mais tarde
                    </p>
                    <Link
                        className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-4"
                        href="/"
                    >
                        Voltar aos álbuns
                    </Link>
                </div>
            )
        }

        return (
            <>
                <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
                    <div className="after:content relative mb-5 flex h-[629px] flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0">
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <span className="absolute left-0 right-0 bottom-0 h-[400px] bg-gradient-to-b from-black/0 via-black to-black"></span>
                        </div>
                        <Logo className="relative w-28 drop-shadow-xl" />
                        <h1 className="text-base font-bold uppercase tracking-widest">
                            Issacar Pictures Beta²
                        </h1>
                        <h3 className="mt-2 text-base font-bold uppercase tracking-widest">
                            Album: {slug.replace(/_/g, ' ')}
                        </h3>
                        <p className="max-w-[40ch] text-white/75 sm:max-w-[32ch]">
                            <strong>Atenção:</strong> Para conseguir baixar as fotos do culto, <strong>utilize o navegador de seu celular</strong>
                        </p>
                        <Link
                            className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-4"
                            href="/"
                        >
                            Voltar aos álbuns
                        </Link>
                    </div>

                    <div className="mb-8">
                        <ImageGalleryInline images={images} slug={slug} />
                    </div>

                    {images.map((img) => {
                        const imageProps = {
                            ...img,
                            id: Number(img.id),
                            slug,
                            blurDataUrl: img.blurDataUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
                        }

                        return (
                            <GalleryImage
                                key={img.id}
                                {...imageProps}
                            />
                        )
                    })}
                </div>

                <footer className="p-6 text-center text-white/80 sm:p-12">
                    <a href="https://issacar.deco.site" className="hover:text-white">Issacar Church</a> &copy; {new Date().getFullYear()}
                </footer>

                <GalleryModalWrapper images={images} slug={slug} />
            </>
        )
    } catch (error) {
        console.error('Erro ao carregar a galeria:', error)
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <Logo className="relative mb-8 w-28 drop-shadow-xl" />
                <p className="text-center text-xl text-white/75">
                    Ops: não foi possível carregar as imagens no momento, tente novamente mais tarde
                </p>
                <Link
                    className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-4"
                    href="/"
                >
                    Voltar aos álbuns
                </Link>
            </div>
        )
    }
}
