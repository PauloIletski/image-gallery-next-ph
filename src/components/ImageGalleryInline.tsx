'use client';

import Lightbox from "yet-another-react-lightbox";
import Inline from "yet-another-react-lightbox/plugins/inline";
import "yet-another-react-lightbox/styles.css";
import { ImageProps } from "@/types/image";
import { useRouter } from "next/navigation";

interface ImageGalleryInlineProps {
    images: ImageProps[];
    slug: string;
}

export default function ImageGalleryInline({ images, slug }: ImageGalleryInlineProps) {
    const router = useRouter();

    const slides = images.map((image) => {
        // URL para o carrossel inline com melhor qualidade
        const inlineUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_1200,q_auto:best/${image.public_id}.${image.format}`;

        return {
            src: inlineUrl,
            width: image.width,
            height: image.height
        };
    });

    const handleClick = (index: number) => {
        router.push(`/issacar-galeries/${slug}/?photoId=${index}`, { scroll: false });
    };

    return (
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
    );
} 