// components/GalleryImage.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ImageProps } from '@/types/image'
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid'
import downloadPhoto from '@/utils/downloadPhoto'
import { checkRateLimit } from '@/utils/cloudinaryRateLimit'

type Props = ImageProps & {
    slug: string
}

export default function GalleryImage({ id, height, width, public_id, format, slug, blurDataUrl }: Props) {
    const [isLoading, setLoading] = useState(true)
    const router = useRouter()
    const isPortrait = height > width

    // Verifica o rate limit antes de transformar a imagem
    const canTransform = checkRateLimit()
    const imageUrl = canTransform
        ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_720/${public_id}.${format}`
        : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${public_id}.${format}`

    return (
        <div
            onClick={() => {
                router.push(`/issacar-galeries/${slug}?photoId=${id}`, { scroll: false })
            }}
            className={`after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight ${isPortrait ? 'aspect-[3/4]' : 'aspect-video'}`}
        >
            <div className="relative w-full">
                <Image
                    alt="Issacar Image"
                    className={`transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110 ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'
                        }`}
                    style={{ transform: 'translate3d(0, 0, 0)' }}
                    placeholder="blur"
                    blurDataURL={blurDataUrl}
                    src={imageUrl}
                    width={width}
                    height={height}
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
                    onLoadingComplete={() => setLoading(false)}
                />
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        downloadPhoto(
                            `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${public_id}.${format}`,
                            `${id}.jpg`
                        )
                    }}
                    className="absolute bottom-2 right-2 z-10 rounded-full bg-white p-2 text-black backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                    title="Download"
                >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
}
