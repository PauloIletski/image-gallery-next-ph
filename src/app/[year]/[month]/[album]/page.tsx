import { google } from 'googleapis';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import type { GalleryFolder, ImageProps } from '@/types/image';

interface PageProps {
    params: {
        year: string;
        month: string;
        album: string;
    };
}

interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
    thumbnailLink?: string;
    imageMediaMetadata?: {
        width: number;
        height: number;
    };
}

async function getFolderFirstImage(drive: any, folderId: string): Promise<GoogleDriveFile | null> {
    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents and mimeType contains 'image/'`,
            fields: 'files(id, name, mimeType, thumbnailLink, imageMediaMetadata)',
            orderBy: 'name',
            pageSize: 1
        });

        const files = response.data.files;
        return files && files.length > 0 ? files[0] as GoogleDriveFile : null;
    } catch (error) {
        console.error(`Erro ao buscar primeira imagem da pasta ${folderId}:`, error);
        return null;
    }
}

async function getSubFolders(drive: any, parentId: string): Promise<{ id: string; name: string }[]> {
    try {
        const response = await drive.files.list({
            q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder'`,
            fields: 'files(id, name)',
            orderBy: 'name desc'
        });

        return (response.data.files || []).map((folder: { id?: string; name?: string }) => ({
            id: folder.id || '',
            name: folder.name || ''
        }));
    } catch (error) {
        console.error('Erro ao buscar subpastas:', error);
        return [];
    }
}

async function getFolders(): Promise<GalleryFolder[]> {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_id: process.env.GOOGLE_CLIENT_ID,
            },
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        const drive = google.drive({ version: 'v3', auth });
        const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '';
        const result: GalleryFolder[] = [];

        // Obtém os anos
        const years = await getSubFolders(drive, ROOT_FOLDER_ID);

        for (const year of years) {
            // Obtém os meses do ano
            const months = await getSubFolders(drive, year.id);

            for (const month of months) {
                // Obtém as pastas temáticas do mês
                const themes = await getSubFolders(drive, month.id);

                for (const theme of themes) {
                    const firstImage = await getFolderFirstImage(drive, theme.id);
                    const slug = `${year.name}_${month.name}_${theme.name}`.toLowerCase().replace(/\s+/g, '_');

                    const folderInfo: GalleryFolder = {
                        slug,
                        id: theme.id,
                        path: {
                            year: year.name,
                            month: month.name,
                            theme: theme.name
                        }
                    };

                    if (firstImage) {
                        folderInfo.thumbnail = {
                            public_id: firstImage.id,
                            format: firstImage.mimeType?.split('/')[1] || 'jpeg'
                        };
                    }

                    result.push(folderInfo);
                }
            }
        }

        return result;
    } catch (error) {
        console.error('Erro ao buscar estrutura de pastas:', error);
        return [];
    }
}

async function getImagesFromFolder(drive: any, folderId: string): Promise<ImageProps[]> {
    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents and mimeType contains 'image/'`,
            fields: 'files(id, name, mimeType, thumbnailLink, imageMediaMetadata)',
            orderBy: 'name',
            pageSize: 400,
        });

        const files = response.data.files as GoogleDriveFile[];

        return files.map((file, index) => ({
            id: index,
            height: file.imageMediaMetadata?.height || 0,
            width: file.imageMediaMetadata?.width || 0,
            public_id: file.id,
            format: file.mimeType?.split('/')[1] || 'jpeg',
            tags: [],
            isPortrait: (file.imageMediaMetadata?.height || 0) > (file.imageMediaMetadata?.width || 0),
        }));
    } catch (error) {
        console.error('Erro ao buscar imagens do Google Drive:', error);
        return [];
    }
}

export const revalidate = 60;

export default async function GalleryPage({ params }: PageProps) {
    const { year, month, album } = params;
    const galleries = await getFolders();

    // Encontra a galeria correspondente
    const gallery = galleries.find((g) =>
        g.path.year === year &&
        g.path.month.toLowerCase() === month.toLowerCase() &&
        g.path.theme.toLowerCase().replace(/\s+/g, '_') === album
    );

    if (!gallery) {
        notFound();
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_id: process.env.GOOGLE_CLIENT_ID,
        },
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const images = await getImagesFromFolder(drive, gallery.id);

    if (!images || images.length === 0) {
        notFound();
    }

    return <Gallery images={images} folder={gallery} />;
} 