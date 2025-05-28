// lib/get-galleries.ts
import cloudinary from '../utils/cloudinary'
import getBase64ImageUrl from '../utils/generateBlurPlaceholder'
import type { ImageProps } from '../utils/types'

export type FolderGallery = {
  slug: string
  displayName: string
  thumbnail: ImageProps
}

export async function getGalleries(): Promise<FolderGallery[]> {
  const { folders } = await cloudinary.v2.api.sub_folders(process.env.CLOUDINARY_ROOT_FOLDER || '')
  const galleries: FolderGallery[] = []

  for (const folder of folders) {
    const slug = folder.name

    const result = await cloudinary.v2.search
      .expression(`folder:galeries/${slug}/*`)
      .sort_by('public_id', 'desc')
      .max_results(1)
      .execute()

    const image = result.resources[0]
    if (!image) continue

    const thumbnail: ImageProps = {
      id: 0,
      height: image.height,
      width: image.width,
      public_id: image.public_id,
      format: image.format,
      blurDataUrl: await getBase64ImageUrl(image)
    }

    galleries.push({
      slug,
      displayName: slug.replace(/_/g, ' '),
      thumbnail
    })
  }

  return galleries
}
