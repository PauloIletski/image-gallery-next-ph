import { cloudinaryService } from "./cloudinaryService";
import { ImageProps } from "@/types/image";

let cachedResults: ImageProps[] | undefined;

export default async function getResults() {
  if (!cachedResults) {
    const { resources } = await cloudinaryService.getGalleryImages('');

    cachedResults = resources.map((result: any) => ({
      id: result.public_id,
      height: result.height,
      width: result.width,
      public_id: result.public_id,
      format: result.format,
      tags: result.tags || [],
    }));
  }

  return cachedResults;
}
