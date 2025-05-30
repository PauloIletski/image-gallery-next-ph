'use client'

import { useSearchParams } from 'next/navigation'
import GalleryModal from './GalleryModal'
import { ImageProps } from '@/types/image'

type GalleryModalWrapperProps = {
    images: ImageProps[]
    slug: string
}

export default function GalleryModalWrapper({ images, slug }: GalleryModalWrapperProps) {
    const searchParams = useSearchParams()
    const photoId = searchParams?.get('photoId')

    if (!photoId) return null

    return (
        <GalleryModal
            images={images}
            slug={slug}
            photoId={photoId}
        />
    )
} 