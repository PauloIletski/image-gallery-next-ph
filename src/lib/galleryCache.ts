import { promises as fs } from 'fs';
import path from 'path';

const cachePath = path.join(process.cwd(), 'data', 'gallerySlugs.json');

export async function saveGallerySlugs(slugs: string[]) {
  await fs.writeFile(cachePath, JSON.stringify({ slugs }, null, 2));
}

export async function loadGallerySlugs(): Promise<string[]> {
  try {
    const data = await fs.readFile(cachePath, 'utf8');
    return JSON.parse(data).slugs || [];
  } catch {
    return [];
  }
}