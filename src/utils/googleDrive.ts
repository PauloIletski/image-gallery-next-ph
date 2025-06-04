import { google, drive_v3 } from 'googleapis';
import type { GalleryFolder, ImageProps } from '@/types/image';

export interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
    thumbnailLink?: string;
    imageMediaMetadata?: {
        width: number;
        height: number;
    };
}

export function getDrive(): drive_v3.Drive {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_id: process.env.GOOGLE_CLIENT_ID,
        },
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    return google.drive({ version: 'v3', auth });
}

export async function getSubFolders(
    drive: drive_v3.Drive,
    parentId: string,
): Promise<{ id: string; name: string }[]> {
    try {
        const response = await drive.files.list({
            q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder'`,
            fields: 'files(id, name)',
            orderBy: 'name desc',
        });
        return (response.data.files || []).map((folder: any) => ({
            id: folder.id || '',
            name: folder.name || '',
        }));
    } catch (error) {
        console.error('Erro ao buscar subpastas:', error);
        return [];
    }
}

export async function getFolderFirstImage(
    drive: drive_v3.Drive,
    folderId: string,
): Promise<GoogleDriveFile | null> {
    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents and mimeType contains 'image/'`,
            fields: 'files(id, name, mimeType, thumbnailLink, imageMediaMetadata)',
            orderBy: 'name',
            pageSize: 1,
        });
        const files = response.data.files as GoogleDriveFile[] | undefined;
        return files && files.length > 0 ? files[0] : null;
    } catch (error) {
        console.error(`Erro ao buscar primeira imagem da pasta ${folderId}:`, error);
        return null;
    }
}

export async function fetchGalleryStructure(
    drive: drive_v3.Drive,
    rootFolderId: string,
): Promise<GalleryFolder[]> {
    const result: GalleryFolder[] = [];
    try {
        const years = await getSubFolders(drive, rootFolderId);
        for (const year of years) {
            const months = await getSubFolders(drive, year.id);
            for (const month of months) {
                const themes = await getSubFolders(drive, month.id);
                for (const theme of themes) {
                    const firstImage = await getFolderFirstImage(drive, theme.id);
                    const slug = `${year.name}_${month.name}_${theme.name}`
                        .toLowerCase()
                        .replace(/\s+/g, '_');
                    const folderInfo: GalleryFolder = {
                        slug,
                        id: theme.id,
                        path: {
                            year: year.name,
                            month: month.name,
                            theme: theme.name,
                        },
                    };
                    if (firstImage) {
                        folderInfo.thumbnail = {
                            public_id: firstImage.id,
                            format: firstImage.mimeType?.split('/')[1] || 'jpeg',
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

export async function getImagesFromFolder(
    drive: drive_v3.Drive,
    folderId: string,
): Promise<ImageProps[]> {
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
            isPortrait:
                (file.imageMediaMetadata?.height || 0) >
                (file.imageMediaMetadata?.width || 0),
        }));
    } catch (error) {
        console.error('Erro ao buscar imagens do Google Drive:', error);
        return [];
    }
}
