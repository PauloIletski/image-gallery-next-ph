'use client'

import { useRouter } from 'next/navigation'
import type { ImageProps } from '@/utils/types'
import { useLastViewedPhoto } from '@/utils/useLastViewedPhoto'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

export default function Carousel({
  index,
  currentPhoto,
  images
}: {
  index: number
  currentPhoto: ImageProps
  images: ImageProps[]
}) {
  const router = useRouter()
  const [, setLastViewedPhoto] = useLastViewedPhoto()

  function closeModal() {
    setLastViewedPhoto(currentPhoto.id)
    router.back()
  }

  const slides = images.map((image) => ({
    src: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_1920/${image.public_id}.${image.format}`,
    alt: 'Issacar Image',
    width: Number(image.width),
    height: Number(image.height)
  }))

  return (
    <Lightbox
      index={index}
      slides={slides}
      open={true}
      close={closeModal}
    />
  )
}
