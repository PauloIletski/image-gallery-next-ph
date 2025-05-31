'use client';

import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Download from 'yet-another-react-lightbox/plugins/download';
import Share from 'yet-another-react-lightbox/plugins/share';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import type { ImageProps } from '@/types/image';

interface ImageGalleryInlineProps {
    images: ImageProps[];
    slug: string;
}

function getThumbnailUrl(fileId: string): string {
    return `https://lh3.googleusercontent.com/d/${fileId}=w800`;
}

function getFullUrl(fileId: string): string {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
}

function getDownloadUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export default function ImageGalleryInline({ images, slug }: ImageGalleryInlineProps) {
    const [index, setIndex] = useState(-1);

    const slides = images.map((image) => ({
        src: getFullUrl(image.public_id),
        alt: `Foto ${image.id + 1} do álbum ${slug}`,
        width: image.width,
        height: image.height,
        description: `Foto ${image.id + 1} do álbum ${slug}`,
        download: getDownloadUrl(image.public_id),
        share: {
            url: getFullUrl(image.public_id),
            title: 'Issacar Pictures',
            text: `Foto ${image.id + 1} do álbum ${slug}`
        }
    }));

    return (
        <>
            <div className="flex flex-wrap gap-4">
                {slides.map((slide, idx) => (
                    <button
                        key={idx}
                        type="button"
                        className="relative h-20 flex-[0_0_80px] overflow-hidden rounded-lg"
                        onClick={() => setIndex(idx)}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={getThumbnailUrl(images[idx].public_id)}
                            alt={slide.alt}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </button>
                ))}
            </div>

            <Lightbox
                index={index}
                slides={slides}
                open={index >= 0}
                close={() => setIndex(-1)}
                plugins={[Captions, Download, Share, Zoom]}
                zoom={{
                    maxZoomPixelRatio: 5,
                    zoomInMultiplier: 2,
                }}
                carousel={{
                    finite: true,
                }}
                render={{
                    buttonPrev: slides.length <= 1 ? () => null : undefined,
                    buttonNext: slides.length <= 1 ? () => null : undefined,
                }}
            />
        </>
    );
} 