'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import useKeypress from 'react-use-keypress'
import type { ImageProps } from '../utils/types'
import SharedModal from './SharedModal'

export default function Modal({
  images,
  slug,
  onClose
}: {
    images: ImageProps[]
    slug: string
    onClose?: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const photoId = searchParams.get('photoId')
  const index = Number(photoId)

  const [direction, setDirection] = useState(0)
  const [curIndex, setCurIndex] = useState(index)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    overlayRef.current?.focus()
  }, [])

  const handleClose = () => {
    router.push(`/issacar-galeries/${slug}`)
    onClose?.()
  }

  const changePhotoId = (newVal: number) => {
    setDirection(newVal > curIndex ? 1 : -1)
    setCurIndex(newVal)
    router.push(`/issacar-galeries/${slug}?photoId=${newVal}`)
  }

  useKeypress('ArrowRight', () => {
    if (curIndex + 1 < images.length) {
      changePhotoId(curIndex + 1)
    }
  })

  useKeypress('ArrowLeft', () => {
    if (curIndex > 0) {
      changePhotoId(curIndex - 1)
    }
  })

  return (
    <div
      tabIndex={-1}
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative z-50 max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          // Prevent propagation for keyboard events as well
          e.stopPropagation();
        }}
        tabIndex={0}
      >
        <SharedModal
          index={curIndex}
          direction={direction}
          images={images}
          changePhotoId={changePhotoId}
          closeModal={handleClose}
          navigation={true}
        />
      </div>
    </div>
  )
}
