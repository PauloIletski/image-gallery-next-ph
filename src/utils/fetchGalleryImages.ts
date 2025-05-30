import cloudinary from './cloudinary';
import getBase64ImageUrl from './generateBlurPlaceholder';
import type { ImageProps } from './types';
import { mockGalleryImages } from './mockData';

export async function fetchGalleryImages(folder: string) {
  try {
    const results = await cloudinary.v2.search
      .expression(`folder:${folder}/*`)
      .sort_by('public_id', 'desc')
      .max_results(400)
      .execute();

    if (!results.resources) {
      return { images: [] };
    }

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
        tags: result.tags || [],
        isPortrait
      });
    }

    const blurImagePromises = images.map((image: ImageProps) => getBase64ImageUrl(image));
    const imagesWithBlurDataUrls = await Promise.all(blurImagePromises);

    return {
      images: images.map((image, idx) => ({
        ...image,
        blurDataUrl: imagesWithBlurDataUrls[idx],
      })),
    };
  } catch (error) {
    console.error('Erro ao buscar imagens da galeria:', error);
    // Se houver erro (incluindo rate limit), retorna o mock
    return { images: mockGalleryImages.default || [] };
  }
}
