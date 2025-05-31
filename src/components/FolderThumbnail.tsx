'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { GalleryFolder } from '@/types/image';

interface FolderThumbnailProps {
    folder: GalleryFolder;
    year: string;
    monthName: string;
    albumName: string;
}

function capitalizeTitle(text: string): string {
    return text
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function getThumbnailUrl(fileId: string): string {
    return `https://lh3.googleusercontent.com/d/${fileId}=w800`;
}

export default function FolderThumbnail({ folder, year, monthName, albumName }: FolderThumbnailProps) {
    return (
        <Link
            href={`/${year}/${monthName}/${albumName}`}
            className="group relative block aspect-square overflow-hidden rounded-lg bg-gray-100 shadow-highlight"
        >
            <div className="absolute inset-0">
                {folder.thumbnail ? (
                    <Image
                        src={getThumbnailUrl(folder.thumbnail.public_id)}
                        className="h-full w-full transform object-cover brightness-90 transition will-change-auto group-hover:brightness-110"
                        style={{ transform: 'translate3d(0, 0, 0)' }}
                        alt={capitalizeTitle(folder.path.theme)}
                        width={400}
                        height={400}
                        priority={true}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <h2 className="text-2xl font-bold text-gray-900">{capitalizeTitle(folder.path.theme)}</h2>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute inset-0 flex items-end justify-center p-4">
                    <h2 className="text-center text-lg font-bold text-white drop-shadow-lg">
                        {capitalizeTitle(folder.path.theme)}
                    </h2>
                </div>
            </div>
        </Link>
    );
} 