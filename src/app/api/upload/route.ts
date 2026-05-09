import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { applyGoogleTokenCookies, getGoogleAccessToken } from '@/utils/googleAuth'
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
    const driveParentId = String(formData.get('driveParentId') || '').trim()
    const root = process.env.CLOUDINARY_ROOT_FOLDER || 'galeries'
    const googleToken = String(formData.get('googleToken') || '').trim()

    if (!slug) {
      return NextResponse.json({ error: 'slug e obrigatorio' }, { status: 400 })
    }
    if (!file) {
      return NextResponse.json({ error: 'arquivo e obrigatorio' }, { status: 400 })
    }

    const tokenResult = await getGoogleAccessToken(req, googleToken)
    const accessToken = tokenResult.accessToken

    if (!accessToken) {
      return applyGoogleTokenCookies(NextResponse.json(
        { error: 'Faca login no Google para manter o backup obrigatorio no Drive' },
        { status: 401 }
      ), tokenResult)
    }

    if (!driveParentId && !process.env.GDRIVE_ROOT_FOLDER) {
      return applyGoogleTokenCookies(NextResponse.json(
        { error: 'Selecione a pasta raiz existente do Google Drive' },
        { status: 400 }
      ), tokenResult)
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let drive
    try {
      drive = await uploadToGoogleDrive({
        accessToken,
        albumName: slug,
        fileName: file.name || 'imagem',
        fileBuffer: buffer,
        mimeType: file.type || 'image/jpeg',
        parentIdOverride: driveParentId || undefined,
      })
    } catch {
      drive = { success: false, message: 'Drive upload nao configurado' }
    }

    if (!drive?.success) {
      return applyGoogleTokenCookies(NextResponse.json(
        { error: drive?.message || 'Falha ao criar backup obrigatorio no Drive', drive },
        { status: 502 }
      ), tokenResult)
    }

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${root}/${slug}`,
          asset_folder: `${root}/${slug}`,
          use_asset_folder_as_public_id_prefix: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }
      )
      stream.end(buffer)
    })

    return applyGoogleTokenCookies(NextResponse.json({ success: true, cloudinary: uploadResult, drive }), tokenResult)
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Falha no upload' }, { status: 500 })
  }
}
