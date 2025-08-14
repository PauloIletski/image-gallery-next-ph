'use client'

import { useState } from 'react'
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
  const [showPopupWarning, setShowPopupWarning] = useState(false)

  const handleDownload = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // Mostrar aviso sobre pop-ups no mobile
      setShowPopupWarning(true)
      setTimeout(() => setShowPopupWarning(false), 3000)
    }
    
    downloadPhoto(
      `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${public_id}.${format}`,
      `${id}.jpg`
    )
  }

  return (
    <div className="relative">
      <button
        onClick={handleDownload}
        onTouchEnd={handleDownload}
        className="absolute bottom-2 right-2 z-10 rounded-full bg-white p-2 text-black backdrop-blur-lg transition hover:bg-black/75 hover:text-white touch-manipulation"
        title="Download"
      >
        <ArrowDownTrayIcon className="h-5 w-5" />
      </button>
      
      {showPopupWarning && (
        <div className="absolute bottom-12 right-2 z-20 bg-black/90 text-white text-xs p-2 rounded-lg max-w-48">
          💡 Dica: Se o download não funcionar, permita pop-ups para este site
        </div>
      )}
    </div>
  )
}
