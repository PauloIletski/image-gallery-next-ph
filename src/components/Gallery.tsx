'use client';

import Link from 'next/link'
import Logo from '@/components/Icons/Logo'
import GalleryImage from '@/components/GalleryImage'
import ImageGalleryInline from '@/components/ImageGalleryInline'
import type { ImageProps, GalleryFolder } from '@/types/image'

interface GalleryProps {
    images: ImageProps[]
    folder: GalleryFolder
}

function formatMonth(month: string): string {
    const months: { [key: string]: string } = {
        '01': 'Janeiro',
        '02': 'Fevereiro',
        '03': 'Março',
        '04': 'Abril',
        '05': 'Maio',
        '06': 'Junho',
        '07': 'Julho',
        '08': 'Agosto',
        '09': 'Setembro',
        '10': 'Outubro',
        '11': 'Novembro',
        '12': 'Dezembro'
    };
    return months[month] || month;
}

export default function Gallery({ images, folder }: GalleryProps) {
    const { path } = folder;
    const title = `${path.theme} - ${formatMonth(path.month)} de ${path.year}`;

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
                        {title}
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
                    <ImageGalleryInline images={images} slug={folder.slug} />
                </div>

                {images.map((img) => {
                    const imageProps = {
                        ...img,
                        id: Number(img.id),
                        slug: folder.slug,
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
        </>
    )
} 