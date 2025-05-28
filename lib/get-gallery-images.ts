import cloudinary from '../utils/cloudinary'
import getBase64ImageUrl from '../utils/generateBlurPlaceholder'
import type { ImageProps } from '../utils/types'

export async function getGalleryPaths() {
  const { folders } = await cloudinary.v2.api.sub_folders(process.env.CLOUDINARY_ROOT_FOLDER || '')
  return folders.map((folder: any) => folder.name)
}

export async function getGalleryImages(slug: string): Promise<{ images: ImageProps[] }> {
  const results = await cloudinary.v2.search
    .expression(`folder:${process.env.CLOUDINARY_ROOT_FOLDER}/${slug}/*`)
    .sort_by('public_id', 'desc')
    .max_results(400)
    .execute()

  const images: ImageProps[] = await Promise.all(
    results.resources.map(async (result: any, i: number) => ({
      id: i,
      height: result.height,
      width: result.width,
      public_id: result.public_id,
      format: result.format,
      blurDataUrl: await getBase64ImageUrl(result)
    }))
  )

  return { images }
}
