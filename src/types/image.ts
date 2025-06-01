export interface ImageProps {
    id: number;
    height: number;
    width: number;
    public_id: string;
    format: string;
    tags: string[];
    blurDataUrl?: string;
    isPortrait?: boolean;
} 