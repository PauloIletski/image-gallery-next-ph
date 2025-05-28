'use client'

import { Metadata } from 'next'
import { fetchGalleryImages } from '../../../../utils/fetchGalleryImages'
import { loadGallerySlugs } from '../../../../lib/galleryCache'
import Carousel from '../../../../components/Carousel'
import { notFound } from 'next/navigation'

type Props = {
  params: {
    slug: string
    photoId: string
  }
}

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await loadGallerySlugs()
  const paths: { slug: string; photoId: string }[] = []

  for (const slug of slugs) {
    const images = await fetchGalleryImages(slug)
    images.forEach((_, index) => {
      paths.push({
        slug,
        photoId: index.toString()
      })
    })
  }

  return paths
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, photoId } = params
  const images = await fetchGalleryImages(slug)
  const currentPhoto = images[parseInt(photoId)]

  if (!currentPhoto) return {}

  const imageUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_2560/${currentPhoto.public_id}.${currentPhoto.format}`

  return {
    title: 'Issacar Fotos',
    openGraph: {
      images: [imageUrl]
    },
    twitter: {
      images: [imageUrl],
      card: 'summary_large_image'
    }
  }
}

export default async function PhotoPage({ params }: Props) {
  const { slug, photoId } = params
  const images = await fetchGalleryImages(slug)
  const currentPhoto = images[parseInt(photoId)]

  if (!currentPhoto) return notFound()

  return (
    <main className="mx-auto max-w-[1960px] p-4">
      <Carousel currentPhoto={currentPhoto} index={parseInt(photoId)} />
    </main>
  )
}
