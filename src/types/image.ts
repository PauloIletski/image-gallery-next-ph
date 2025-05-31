export interface ImageProps {
    id: number;
    height: number;
    width: number;
    public_id: string;
    format: string;
    tags: string[];
    isPortrait: boolean;
    blurDataUrl?: string;
}

export interface GalleryFolder {
    slug: string;
    id: string;
    thumbnail?: {
        public_id: string;
        format: string;
    };
    path: {
        year: string;
        month: string;
        theme: string;
    };
} 