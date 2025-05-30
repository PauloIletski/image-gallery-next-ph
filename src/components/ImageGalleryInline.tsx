'use client';

import Lightbox from "yet-another-react-lightbox";
import Inline from "yet-another-react-lightbox/plugins/inline";
import Download from "yet-another-react-lightbox/plugins/download";
import Share from "yet-another-react-lightbox/plugins/share";
import "yet-another-react-lightbox/styles.css";
import { ImageProps } from "@/types/image";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ImageGalleryInlineProps {
    images: ImageProps[];
    slug: string;
}

export default function ImageGalleryInline({ images, slug }: ImageGalleryInlineProps) {
    const [index, setIndex] = useState(-1);
    const router = useRouter();
    const searchParams = useSearchParams();
    const photoId = searchParams?.get("photoId");

    useEffect(() => {
        if (photoId) {
            const newIndex = parseInt(photoId, 10);
            if (!isNaN(newIndex) && newIndex >= 0 && newIndex < images.length) {
                setIndex(newIndex);
            }
        }
    }, [photoId, images.length]);

    const slides = useMemo(() => images.map((image) => {
        // URL para o carrossel inline (menor e otimizada)
        const inlineUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_800,q_auto:good/${image.public_id}.${image.format}`;

        // URL para o modal (alta qualidade)
        const modalUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/q_auto:best/${image.public_id}.${image.format}`;

        // URL para download (qualidade original)
        const downloadUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/fl_attachment/${image.public_id}.${image.format}`;

        return {
            src: index >= 0 ? modalUrl : inlineUrl,
            width: image.width,
            height: image.height,
            download: downloadUrl,
            share: {
                url: modalUrl,
                title: 'Issacar Pictures',
                text: 'Confira esta foto da Issacar Church!'
            }
        };
    }), [images, index]);

    const handleClose = () => {
        setIndex(-1);
        // Navega para a URL base da galeria
        router.push(`/issacar-galeries/${slug}/`);
    };

    const handleClick = (idx: number) => {
        setIndex(idx);
        // Atualiza a URL com o novo photoId
        router.push(`/issacar-galeries/${slug}/?photoId=${idx}`);
    };

    return (
        <>
            <div className="w-full max-w-[900px] aspect-[3/2] mx-auto">
                <Lightbox
                    plugins={[Inline]}
                    slides={slides}
                    carousel={{
                        padding: 0,
                        spacing: 0,
                        imageFit: "cover",
                        preload: 2
                    }}
                    on={{
                        click: ({ index }) => handleClick(index)
                    }}
                />
            </div>

            <Lightbox
                plugins={[Download, Share]}
                slides={slides}
                open={index >= 0}
                index={index}
                close={handleClose}
                carousel={{
                    imageFit: "contain",
                    preload: 1
                }}
                render={{
                    buttonPrev: index === 0 ? () => null : undefined,
                    buttonNext: index === slides.length - 1 ? () => null : undefined
                }}
                on={{
                    view: ({ index: newIndex }) => {
                        if (newIndex !== index) {
                            handleClick(newIndex);
                        }
                    }
                }}
            />
        </>
    );
} 