// pages/api/cron/update-galleries.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { cloudinaryService } from '../../../utils/cloudinaryService';
import { saveGallerySlugs } from '../../../lib/galleryCache';

const DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  try {
    const { folders } = await cloudinaryService.getGalleryFolders();
    const slugs = folders.map((folder: any) => folder.name);

    await saveGallerySlugs(slugs);

    if (DEPLOY_HOOK) {
      await fetch(DEPLOY_HOOK, { method: 'POST' });
    }

    res.status(200).json({ success: true, slugs });
  } catch (err) {
    console.error('Erro ao atualizar pastas:', err);
    res.status(500).json({ error: 'Erro ao buscar pastas do Cloudinary' });
  }
}
