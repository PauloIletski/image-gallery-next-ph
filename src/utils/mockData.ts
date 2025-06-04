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

import type { GalleryFolder } from '@/types/image';

export const mockGalleryFolders: GalleryFolder[] = [
    {
        slug: '2025_maio_culto_lifes',
        id: 'mock-folder-1',
        path: {
            year: '2025',
            month: '05',
            theme: 'Culto Lifes'
        },
        thumbnail: {
            public_id: 'galeries/default/image1',
            format: 'jpg'
        }
    },
    {
        slug: '2024_dezembro_abertura_extraordinario',
        id: 'mock-folder-2',
        path: {
            year: '2024',
            month: '12',
            theme: 'Abertura Extraordinário'
        },
        thumbnail: {
            public_id: 'galeries/default/image2',
            format: 'jpg'
        }
    }
];
