'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Download from 'yet-another-react-lightbox/plugins/download'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import type { ImageProps } from '@/utils/types'
import downloadPhoto from '@/utils/downloadPhoto'

type Props = {
    images: ImageProps[]
    slug: string
    photoId: string
}

export default function GalleryModal({ images, slug, photoId }: Props) {
    const router = useRouter()
    const index = Number(photoId)
    const [currentIndex, setCurrentIndex] = useState(index)
    const [isDownloading, setIsDownloading] = useState(false)

    const slides = images.map((image, order) => {
        // URL para visualização em alta qualidade
        const viewUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/q_auto:best/${image.public_id}.${image.format}`

        // URL para download em qualidade original
        const downloadUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${image.public_id}.${image.format}`

        // URL para thumbnail otimizada
        const thumbnailUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_100,q_auto/${image.public_id}.${image.format}`

        return {
            src: viewUrl,
            alt: 'Issacar Image',
            width: Number(image.width),
            height: Number(image.height),
            download: downloadUrl,
            thumbnails: {
                src: thumbnailUrl,
                alt: 'Thumbnail'
            }
        }
    })

    const handleDownload = async () => {
        // Evitar múltiplos cliques durante o download
        if (isDownloading) return
        
        const downloadUrl = slides[currentIndex]?.download
        if (downloadUrl) {
            setIsDownloading(true)
            try {
                downloadPhoto(downloadUrl, undefined, slug, currentIndex)
            } finally {
                // Aguardar a conclusão do download antes de permitir novo clique
                setTimeout(() => {
                    setIsDownloading(false)
                }, 1000)
            }
        }
    }

    return (
        <>
            <Lightbox
                index={index}
                slides={slides}
                open={true}
                close={() => router.back()}
                plugins={[Zoom, Thumbnails]}
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
                on={{
                    view: ({ index: viewIndex }) => {
                        setCurrentIndex(viewIndex)
                    }
                }}
            />
            <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                aria-label={isDownloading ? "Baixando..." : "Download"}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 9999,
                    background: isDownloading ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isDownloading ? 'not-allowed' : 'pointer',
                    color: 'white',
                    opacity: isDownloading ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{opacity: isDownloading ? 0.5 : 1}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
            </button>
        </>
    )
} 