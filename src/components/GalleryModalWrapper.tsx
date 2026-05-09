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

    // Debug: log quando os search params mudam
    if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.debug('[GalleryModalWrapper] searchParams:', String(searchParams), 'photoId:', photoId)
    }

    if (!photoId) return null

    return (
        <GalleryModal
            images={images}
            slug={slug}
            photoId={photoId}
        />
    )
} 
