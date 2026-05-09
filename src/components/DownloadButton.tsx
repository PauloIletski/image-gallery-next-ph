'use client'

import { ArrowDownTrayIcon } from '@heroicons/react/24/solid'
import downloadPhoto from '@/utils/downloadPhoto'
import { useState } from 'react'

interface DownloadButtonProps {
  url: string
  filename: string
  public_id: string
  format: string
  id: string
}

export default function DownloadButton({ url, filename, public_id, format, id }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Evitar múltiplos cliques durante o download
    if (isDownloading) return
    
    setIsDownloading(true)
    
    try {
      downloadPhoto(
        `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${public_id}.${format}`,
        `${id}.jpg`
      )
    } finally {
      setTimeout(() => {
        setIsDownloading(false)
      }, 300)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="absolute bottom-2 right-2 z-10 rounded-full bg-white p-2 text-black backdrop-blur-lg transition hover:bg-black/75 hover:text-white touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
      title={isDownloading ? "Baixando..." : "Download"}
    >
      <ArrowDownTrayIcon className="h-5 w-5" />
    </button>
  )
}
