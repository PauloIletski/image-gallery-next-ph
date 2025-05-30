import { ImageProps } from "@/types/image";

export const mockGalleryImages: { [key: string]: ImageProps[] } = {
    default: [
        {
            id: 0,
            height: 1080,
            width: 1920,
            public_id: 'galeries/default/image1',
            format: 'jpg',
            tags: [],
            isPortrait: false
        },
        {
            id: 1,
            height: 1920,
            width: 1080,
            public_id: 'galeries/default/image2',
            format: 'jpg',
            tags: [],
            isPortrait: true
        }
    ]
}; 