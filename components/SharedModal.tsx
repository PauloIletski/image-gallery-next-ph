'use client'

import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUturnLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import downloadPhoto from '@/utils/downloadPhoto'
import { range } from '@/utils/range'
import type { ImageProps, SharedModalProps } from '@/utils/types'
import Twitter from './Icons/Twitter'

export default function SharedModal({
  index,
  images,
  changePhotoId,
  closeModal,
  navigation,
  currentPhoto,
  direction
}: SharedModalProps) {
  const [loaded, setLoaded] = useState(false)
  const filteredImages = images?.filter((img: ImageProps) =>
    range(index - 15, index + 15).includes(img.id)
  )

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (index < images.length - 1) changePhotoId(index + 1)
    },
    onSwipedRight: () => {
      if (index > 0) changePhotoId(index - 1)
    },
    trackMouse: true
  })

  const currentImage = images ? images[index] : currentPhoto

  return (
    <div
      className="relative z-50 flex aspect-[3/2] w-full max-w-7xl items-center wide:h-full xl:taller-than-854:h-auto"
      {...handlers}
    >
      <div className="w-full overflow-hidden">
        <div className="relative flex aspect-[3/2] items-center justify-center">
          <div className="animate-in fade-in relative">
            <Image
              src={`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,${navigation ? 'w_1280' : 'w_1920'
                }/${currentImage.public_id}.${currentImage.format}`}
              width={navigation ? 1280 : 1920}
              height={navigation ? 853 : 1280}
              priority
              alt="Imagem em destaque"
              onLoad={() => setLoaded(true)}
              className="rounded-md object-contain"
            />
          </div>
        </div>
      </div>

      {loaded && (
        <div className="absolute inset-0 mx-auto flex max-w-7xl items-center justify-center">
          {navigation && index > 0 && (
            <button
              onClick={() => changePhotoId(index - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          )}
          {navigation && index + 1 < images.length && (
            <button
              onClick={() => changePhotoId(index + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          )}

          <div className="absolute top-0 right-0 flex items-center gap-2 p-3 text-white">
            {navigation ? (
              <a
                href={`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${currentImage.public_id}.${currentImage.format}`}
                target="_blank"
                rel="noreferrer"
                title="Abrir imagem em nova aba"
                className="rounded-full bg-black/50 p-2 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
              </a>
            ) : (
              <a
                  href={`https://twitter.com/intent/tweet?text=Veja%20essa%20foto%20em%20https://issacar.vercel.app/p/${index}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Compartilhar no Twitter"
                  className="rounded-full bg-black/50 p-2 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}

            <button
              onClick={() =>
                downloadPhoto(
                  `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${currentImage.public_id}.${currentImage.format}`,
                  `${index}.jpg`
                )
              }
              className="rounded-full bg-black/50 p-2 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
              title="Baixar imagem"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute top-0 left-0 flex items-center gap-2 p-3 text-white">
            <button
              onClick={closeModal}
              className="rounded-full bg-black/50 p-2 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
              title="Fechar"
            >
              {navigation ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <ArrowUturnLeftIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}

      {navigation && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-b from-black/0 to-black/60">
          <div className="mx-auto mt-6 mb-6 flex h-14 overflow-x-auto gap-2 px-4">
            {filteredImages.map(({ public_id, format, id }) => (
              <button
                key={id}
                onClick={() => changePhotoId(id)}
                className={`relative shrink-0 overflow-hidden rounded-md w-32 h-20 ${id === index ? 'ring-2 ring-white' : ''
                  }`}
              >
                <Image
                  alt="Miniatura"
                  width={180}
                  height={120}
                  src={`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_180/${public_id}.${format}`}
                  className="object-cover h-full w-full"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
