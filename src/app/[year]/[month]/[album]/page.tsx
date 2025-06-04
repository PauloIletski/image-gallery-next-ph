import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import type { GalleryFolder, ImageProps } from '@/types/image';
import { getDrive, fetchGalleryStructure, getImagesFromFolder } from '@/utils/googleDrive';

interface PageProps {
    params: {
        year: string;
        month: string;
        album: string;
    };
}


export const revalidate = 60;

export default async function GalleryPage({ params }: PageProps) {
    const { year, month, album } = params;
    const drive = getDrive();
    const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '';
    const galleries = await fetchGalleryStructure(drive, ROOT_FOLDER_ID);

    // Encontra a galeria correspondente
    const gallery = galleries.find((g) =>
        g.path.year === year &&
        g.path.month.toLowerCase() === month.toLowerCase() &&
        g.path.theme.toLowerCase().replace(/\s+/g, '_') === album
    );

    if (!gallery) {
        notFound();
    }

    const images = await getImagesFromFolder(drive, gallery.id);

    if (!images || images.length === 0) {
        notFound();
    }

    return <Gallery images={images} folder={gallery} />;
} 