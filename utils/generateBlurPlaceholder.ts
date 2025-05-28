import sharp from 'sharp'

export default async function getBase64ImageUrl(image: {
  public_id: string
  format: string
}): Promise<string> {
  const imageUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_10/${image.public_id}.${image.format}`

  const res = await fetch(imageUrl)
  const buffer = await res.arrayBuffer()

  const base64 = await sharp(Buffer.from(buffer))
    .resize(10)
    .blur()
    .toBuffer()
    .then(data => `data:image/jpeg;base64,${data.toString('base64')}`)

  return base64
}
