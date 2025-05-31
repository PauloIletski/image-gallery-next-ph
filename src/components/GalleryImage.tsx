// components/GalleryImage.tsx
'use client'

import Image from 'next/image'
import type { ImageProps } from '@/types/image'

interface GalleryImageProps extends ImageProps {
    slug: string
    isPortrait: boolean
}

function getThumbnailUrl(fileId: string): string {
    return `https://lh3.googleusercontent.com/d/${fileId}=w800`;
}

export default function GalleryImage(props: GalleryImageProps) {
    const { id, height, width, public_id, slug, isPortrait } = props
    const aspectRatio = width / height

    // Calcula as dimensões mantendo a proporção
    const calculatedWidth = isPortrait ? 800 : 1200
    const calculatedHeight = Math.round(calculatedWidth / aspectRatio)

    return (
        <div className={`after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight ${isPortrait ? 'aspect-[3/4]' : 'aspect-video'}`}>
            <Image
                alt={`Foto ${id + 1} do álbum ${slug}`}
                className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                style={{ transform: 'translate3d(0, 0, 0)' }}
                src={getThumbnailUrl(public_id)}
                width={calculatedWidth}
                height={calculatedHeight}
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
                priority={id <= 10}
                quality={85}
                loading={id <= 10 ? 'eager' : 'lazy'}
            />
        </div>
    )
}
