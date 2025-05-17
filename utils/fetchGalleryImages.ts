import cloudinary from './cloudinary';
import getBase64ImageUrl from './generateBlurPlaceholder';
import type { ImageProps } from './types';

export async function fetchGalleryImages(slug: string): Promise<ImageProps[]> {
  const results = await cloudinary.v2.search
    .expression(`folder:${slug}/*`)
    .sort_by('public_id', 'desc')
    .max_results(400)
    .execute();

  const images: ImageProps[] = [];
  let i = 0;

  for (let result of results.resources) {
    const isPortrait = result.width < result.height;
    images.push({
      id: i++,
      height: result.height,
      width: result.width,
      public_id: result.public_id,
      format: result.format,
      isPortrait
    });
  }

  const blurImagePromises = images.map((image: ImageProps) => getBase64ImageUrl(image));
  const imagesWithBlurDataUrls = await Promise.all(blurImagePromises);

  return images.map((image, idx) => ({
    ...image,
    blurDataUrl: imagesWithBlurDataUrls[idx],
  }));
}
