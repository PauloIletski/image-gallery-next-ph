'use client'

import { ArrowDownTrayIcon } from '@heroicons/react/24/solid'
import downloadPhoto from '@/utils/downloadPhoto'

interface DownloadButtonProps {
  url: string
  filename: string
  public_id: string
  format: string
  id: string
}

export default function DownloadButton({ url, filename, public_id, format, id }: DownloadButtonProps) {
  const handleDownload = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    downloadPhoto(
      `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${public_id}.${format}`,
      `${id}.jpg`
    )
  }

  return (
    <button
      onClick={handleDownload}
      onTouchEnd={handleDownload}
      className="absolute bottom-2 right-2 z-10 rounded-full bg-white p-2 text-black backdrop-blur-lg transition hover:bg-black/75 hover:text-white touch-manipulation"
      title="Download"
    >
      <ArrowDownTrayIcon className="h-5 w-5" />
    </button>
  )
}
