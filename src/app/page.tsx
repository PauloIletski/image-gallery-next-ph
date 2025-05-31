import Link from 'next/link'
import Logo from '@/components/Icons/Logo'
import type { GalleryFolder } from '@/types/image'
import FolderThumbnail from '@/components/FolderThumbnail'
import { google } from 'googleapis'

export const revalidate = 60

function formatMonth(month: string): string {
    const months: { [key: string]: string } = {
        '01': 'Janeiro',
        '02': 'Fevereiro',
        '03': 'Março',
        '04': 'Abril',
        '05': 'Maio',
        '06': 'Junho',
        '07': 'Julho',
        '08': 'Agosto',
        '09': 'Setembro',
        '10': 'Outubro',
        '11': 'Novembro',
        '12': 'Dezembro'
    };
    return months[month] || month;
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

export default async function HomePage() {
    const folders = await getFolders();

    // Organizar pastas por ano e mês
    const organizedFolders = folders.reduce((acc, folder) => {
        const { year, month } = folder.path;
        if (!acc[year]) {
            acc[year] = {};
        }
        if (!acc[year][month]) {
            acc[year][month] = [];
        }
        acc[year][month].push(folder);
        return acc;
    }, {} as { [year: string]: { [month: string]: GalleryFolder[] } });

    return (
        <main className="mx-auto max-w-[1960px] p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                <div className="relative col-span-1 row-span-1 flex flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 p-6 text-center text-white shadow-highlight sm:col-span-2 sm:p-8 md:aspect-[2.4/1] md:row-span-1">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/0"></div>
                    </div>
                    <Logo className="relative w-28 drop-shadow-xl" />
                    <h1 className="relative mt-4 text-2xl font-bold uppercase tracking-widest drop-shadow-lg">
                        Issacar Pictures Beta²
                    </h1>
                    <p className="relative mt-2 max-w-[40ch] text-white/75 drop-shadow-lg sm:max-w-[32ch]">
                        Bem-vindo à galeria de fotos da Issacar Church. Selecione um álbum abaixo para ver as fotos.
                    </p>
                    <Link
                        className="relative mt-4 rounded-lg border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-6"
                        href="https://issacar.deco.site"
                    >
                        Voltar ao site
                    </Link>
                </div>

                {Object.entries(organizedFolders).sort((a, b) => b[0].localeCompare(a[0])).map(([year, months]) => (
                    <div key={year} className="col-span-full">
                        <h2 className="mb-4 text-2xl font-bold text-white">{year}</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {Object.entries(months).sort((a, b) => b[0].localeCompare(a[0])).map(([month, folders]) => (
                                <div key={`${year}-${month}`} className="col-span-full">
                                    <h3 className="mb-4 text-xl font-semibold text-white/80">{formatMonth(month)}</h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                        {folders.map((folder) => {
                                            const monthName = month.toLowerCase();
                                            const albumName = folder.path.theme.toLowerCase().replace(/\s+/g, '_');

                                            return (
                                                <FolderThumbnail
                                                    key={folder.slug}
                                                    folder={folder}
                                                    year={year}
                                                    monthName={monthName}
                                                    albumName={albumName}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <footer className="mt-8 p-6 text-center text-white/80 sm:p-12">
                <a href="https://issacar.deco.site" className="hover:text-white">Issacar Church</a> &copy; {new Date().getFullYear()}
            </footer>
        </main>
    )
} 