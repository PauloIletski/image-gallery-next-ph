'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useLastViewedPhoto } from '@/utils/useLastViewedPhoto'
import type { ImageProps } from '@/utils/types'

export default function ImageGrid({ images, slug }: { images: ImageProps[]; slug: string }) {
    const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto()
    const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({})

    const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null)

    useEffect(() => {
        if (lastViewedPhoto && lastViewedPhotoRef.current) {
            lastViewedPhotoRef.current.scrollIntoView({ block: 'center' })
            setLastViewedPhoto(null)
        }
    }, [lastViewedPhoto, setLastViewedPhoto])

    const handleImageLoad = (id: number) => {
        setLoadingImages(prev => ({ ...prev, [id]: false }))
    }

    return (
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
            {images.map(({ id, public_id, format, blurDataUrl }) => (
                <Link
                    key={id}
                    href={`/issacar-galeries/${slug}?photoId=${id}`}
                    ref={id === lastViewedPhoto ? lastViewedPhotoRef : null}
                    className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
                >
                    <Image
                        alt="Issacar Image"
                        className={`transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110 ${loadingImages[id] ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}`}
                        style={{ transform: 'translate3d(0, 0, 0)' }}
                        placeholder="blur"
                        blurDataURL={blurDataUrl}
                        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_720/${public_id}.${format}`}
                        width={720}
                        height={480}
                        sizes="(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw"
                        onLoad={() => handleImageLoad(id)}
                    />
                </Link>
            ))}
        </div>
    )
} 