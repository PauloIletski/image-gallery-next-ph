import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { uploadToGoogleDrive } from '@/utils/googleDrive'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const slug = String(formData.get('slug') || '').trim()
    const file = formData.get('file') as File | null
    const root = process.env.CLOUDINARY_ROOT_FOLDER || 'galeries'

    if (!slug) {
      return NextResponse.json({ error: 'slug é obrigatório' }, { status: 400 })
    }
    if (!file) {
      return NextResponse.json({ error: 'arquivo é obrigatório' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${root}/${slug}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }
      )
      stream.end(buffer)
    })

    // Tentativa de upload paralelo/seguido ao Google Drive (opcional, depende de auth e deps)
    const driveAuthHeader = req.headers.get('authorization') || ''
    const accessToken = driveAuthHeader.startsWith('Bearer ')
      ? driveAuthHeader.slice('Bearer '.length)
      : ''

    let drive
    try {
      drive = await uploadToGoogleDrive({
        accessToken,
        albumName: slug,
        fileName: (file as any).name || `${uploadResult.public_id}.${uploadResult.format}`,
        fileBuffer: buffer,
        mimeType: (file as any).type || 'image/jpeg',
      })
    } catch (e) {
      drive = { success: false, message: 'Drive upload não configurado' }
    }

    return NextResponse.json({ success: true, cloudinary: uploadResult, drive })
  } catch (error: any) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Falha no upload' }, { status: 500 })
  }
}


