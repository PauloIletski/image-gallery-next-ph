'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getGalleryImages } from '../../../lib/get-gallery-images'
import Logo from '../../../components/Icons/Logo'
import Modal from '../../../components/Modal'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import downloadPhoto from '../../../utils/downloadPhoto'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

type Props = {
  params: { slug: string }
  searchParams: { photoId?: string }
}

export async function generateStaticParams() {
  const slugs = await import('../../../lib/get-gallery-images').then(mod => mod.getGalleryPaths())
  return slugs.map(slug => ({ slug }))
}

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Issacar Pictures BETA¹',
  description: 'Visualização de galeria'
}

export default async function GalleryPage({ params, searchParams }: Props) {
  const { slug } = params
  const { images } = await getGalleryImages(slug)

  if (!images || images.length === 0) return notFound()

  return (
    <main className="mx-auto max-w-[1960px] p-4">
      {searchParams.photoId && (
        <Modal
          images={images}
          slug={slug}
          onClose={() => {
            // client-side handled, this remains for consistency
          }}
        />
      )}

      <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
        <div className="after:content relative mb-5 flex h-[629px] flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span className="absolute left-0 right-0 bottom-0 h-[400px] bg-gradient-to-b from-black/0 via-black to-black"></span>
          </div>
          <Logo />
          <h1 className="text-base font-bold uppercase tracking-widest">Issacar Pictures Beta¹</h1>
          <h3 className="mt-2 text-base font-bold uppercase tracking-widest">Album: {slug.replace(/_/g, ' ')}</h3>
          <p className="max-w-[40ch] text-white/75 sm:max-w-[32ch]">
            <strong>Atenção:</strong> Para conseguir baixar as fotos do culto, <strong>utilize o navegador de seu celular</strong>
          </p>
          <a
            className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-4"
            href="/"
          >
            Voltar aos álbuns.
          </a>
        </div>

        {images.map(({ id, public_id, format, blurDataUrl, height, width }) => (
          <Link
            key={id}
            href={`/issacar-galeries/${slug}?photoId=${id}`}
            className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
          >
            <div className="relative w-full">
              <Image
                alt="Issacar Image"
                className={`rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110 ${
                  height > width ? 'object-contain bg-black' : 'object-cover'
                }`}
                placeholder="blur"
                blurDataURL={blurDataUrl}
                src={`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_720/${public_id}.${format}`}
                width={parseInt(width)}
                height={parseInt(height)}
                sizes="(max-width: 640px) 100vw,
                       (max-width: 1280px) 50vw,
                       (max-width: 1536px) 33vw,
                       25vw"
              />
              <button
                onClick={(e) => {
                  e.preventDefault()
                  downloadPhoto(
                    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${public_id}.${format}`,
                    `${id}.jpg`
                  )
                }}
                className="absolute bottom-2 right-2 z-10 rounded-full bg-white p-2 text-black backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                title="Download"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
            </div>
          </Link>
        ))}
      </div>

      <footer className="p-6 text-center text-white/80 sm:p-12">
        <a href="https://issacar.deco.site">Issacar Church</a> &copy; {new Date().getFullYear()}
      </footer>
    </main>
  )
}
