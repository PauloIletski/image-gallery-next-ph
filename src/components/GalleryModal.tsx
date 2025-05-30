'use client'

import { useRouter } from 'next/navigation'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Download from 'yet-another-react-lightbox/plugins/download'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import type { ImageProps } from '@/utils/types'
import { Cloudinary } from '@cloudinary/url-gen'
import { scale } from '@cloudinary/url-gen/actions/resize'
import { format, quality } from '@cloudinary/url-gen/actions/delivery'
import { auto } from '@cloudinary/url-gen/qualifiers/format'
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality'
import type { ReactNode } from 'react'
import { checkRateLimit } from '@/utils/cloudinaryRateLimit'

const cld = new Cloudinary({
    cloud: {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    },
    url: {
        secure: true
    }
})

type Props = {
    images: ImageProps[]
    slug: string
    photoId: string
}

export default function GalleryModal({ images, slug, photoId }: Props) {
    const router = useRouter()
    const index = Number(photoId)

    const slides = images.map((image) => {
        // Verifica o rate limit antes de cada transformação
        const canTransform = checkRateLimit()
        const cldImage = cld.image(image.public_id)

        // Se não puder transformar, usa a imagem original
        if (!canTransform) {
            return {
                src: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${image.public_id}.${image.format}`,
                alt: 'Issacar Image',
                width: Number(image.width),
                height: Number(image.height)
            }
        }

        cldImage.addTransformation('f_auto,q_auto') // Usando string de transformação direta

        // Imagem principal em alta resolução
        const mainImage = cldImage.resize(scale().width(1920))

        // Thumbnail otimizada
        const thumbnail = cldImage.resize(scale().width(100))

        return {
            src: mainImage.toURL(),
            alt: 'Issacar Image',
            width: Number(image.width),
            height: Number(image.height),
            srcSet: [
                { src: cldImage.resize(scale().width(640)).toURL(), width: 640, height: Math.round(640 * Number(image.height) / Number(image.width)) },
                { src: cldImage.resize(scale().width(1024)).toURL(), width: 1024, height: Math.round(1024 * Number(image.height) / Number(image.width)) },
                { src: cldImage.resize(scale().width(1920)).toURL(), width: 1920, height: Math.round(1920 * Number(image.height) / Number(image.width)) }
            ],
            thumbnails: {
                src: thumbnail.toURL(),
                alt: 'Thumbnail'
            }
        }
    })

    return (
        <Lightbox
            index={index}
            slides={slides}
            open={true}
            close={() => router.back()}
            plugins={[Zoom, Download, Thumbnails]}
            carousel={{
                padding: 0,
                spacing: 0,
                imageFit: "contain"
            }}
            zoom={{
                maxZoomPixelRatio: 3,
                scrollToZoom: true
            }}
            thumbnails={{
                position: "bottom",
                width: 100,
                height: 60,
                border: 1,
                borderRadius: 4,
                padding: 4,
                gap: 16
            }}
            styles={{
                container: { backgroundColor: "rgba(0, 0, 0, .9)" },
                thumbnailsContainer: { backgroundColor: "rgba(0, 0, 0, .8)" }
            }}
            render={{
                iconDownload: () => (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                )
            }}
        />
    )
} 