import cloudinary from "./cloudinary";
import { ImageProps } from "@/types/image";

let cachedResults: ImageProps[] | undefined;

export default async function getResults() {
  if (!cachedResults) {
    const fetchedResults = await cloudinary.v2.search
      .expression("resource_type:image")
      .sort_by("created_at", "desc")
      .with_field("tags")
      .max_results(400)
      .execute();

    cachedResults = fetchedResults.resources.map((result: any) => ({
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
