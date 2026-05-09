import { isSocialMediaBrowser } from './detectInstagram'

function getFilename(url: string, filename?: string, albumName?: string, order?: number) {
  if (albumName && order !== undefined) {
    const date = new Date()
    const dateStr = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('')
    const cleanAlbumName = albumName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    const orderStr = String(order + 1).padStart(3, '0')
    const extension = url.split('.').pop()?.split('?')[0] || 'jpg'

    return `${cleanAlbumName}_${orderStr}_${dateStr}.${extension}`
  }

  return filename || url.split('\\').pop()?.split('/').pop() || 'image.jpg'
}

function getAttachmentUrl(url: string, filename: string) {
  const filenameWithoutExtension = filename
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')

  const attachmentFlag = filenameWithoutExtension
    ? `fl_attachment:${encodeURIComponent(filenameWithoutExtension)}`
    : 'fl_attachment'

  if (!url.includes('/image/upload/')) return url

  return url.replace('/image/upload/', `/image/upload/${attachmentFlag}/`)
}

export default function downloadPhoto(
  url: string,
  filename?: string,
  albumName?: string,
  order?: number
) {
  const finalFilename = getFilename(url, filename, albumName, order)
  const downloadUrl = getAttachmentUrl(url, finalFilename)

  if (isSocialMediaBrowser()) {
    window.open(downloadUrl, '_blank', 'noopener,noreferrer')
    return
  }

  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = finalFilename
  link.rel = 'noopener noreferrer'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
