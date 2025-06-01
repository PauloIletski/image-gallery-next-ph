import { v2 as cloudinary } from 'cloudinary'
import getBase64ImageUrl from '../utils/generateBlurPlaceholder'
import { DEFAULT_GALLERY_IMAGE } from '../config/defaults'

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

interface CloudinaryFolder {
    name: string
    path: string
}

export interface Gallery {
    slug: string
    displayName: string
    thumbnail: {
        public_id: string
        format: string
        blurDataUrl: string
    }
}

export async function getGalleries(): Promise<Gallery[]> {
    try {
        const { folders } = await cloudinary.api.sub_folders('galeries')

        const galleriesWithThumbnails = await Promise.all(
            folders.map(async (folder: CloudinaryFolder) => {
                try {
                    // Busca a primeira imagem da pasta
                    const { resources } = await cloudinary.search
                        .expression(`folder:galeries/${folder.name}/*`)
                        .sort_by('created_at', 'desc')
                        .max_results(1)
                        .execute()

                    // Se encontrou uma imagem na pasta
                    if (resources && resources.length > 0) {
                        const blurDataUrl = await getBase64ImageUrl({
                            public_id: resources[0].public_id,
                            format: resources[0].format
                        })

                        return {
                            slug: folder.name,
                            displayName: folder.name.replace(/_/g, ' '),
                            thumbnail: {
                                public_id: resources[0].public_id,
                                format: resources[0].format,
                                blurDataUrl
                            }
                        }
                    }

                    // Se não encontrou imagem na pasta, retorna um placeholder
                    return {
                        slug: folder.name,
                        displayName: folder.name.replace(/_/g, ' '),
                        thumbnail: {
                            public_id: 'placeholder',
                            format: 'jpg',
                            blurDataUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
                        }
                    }
                } catch (error) {
                    console.error(`Erro ao buscar thumbnail para ${folder.name}:`, error)
                    return {
                        slug: folder.name,
                        displayName: folder.name.replace(/_/g, ' '),
                        thumbnail: {
                            public_id: 'placeholder',
                            format: 'jpg',
                            blurDataUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
                        }
                    }
                }
            })
        )

        // Filtra apenas as galerias que têm imagens
        return galleriesWithThumbnails.filter(gallery => gallery.thumbnail.public_id !== 'placeholder')
    } catch (error) {
        console.error('Erro ao buscar galerias:', error)
        return []
    }
} 