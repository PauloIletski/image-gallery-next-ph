import Link from 'next/link'
import Image from 'next/image'
import { getGalleries } from '../lib/getGalleries'

export const dynamic = 'force-static' // Comportamento similar ao getStaticProps
export const revalidate = 300 // ISR

export default async function HomePage() {
  const galleries = await getGalleries()
  const date= new Date().getFullYear()

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <main className="flex-grow w-full max-w-6xl mx-auto p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 p-2">
          <h1 className="text-white text-3xl font-bold mb-8">Galerias da Issacar 📸</h1>
          <a
            className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-4"
            href="https://issacar.deco.site/"
            rel="noreferrer"
          >
            Voltar ao Site
          </a>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map(({ slug, displayName, thumbnail }) => (
            <Link
              href={`/issacar-galeries/${slug}`}
              key={slug}
              className="block rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition"
            >
              <div className="relative w-full aspect-[3/2]">
                <Image
                  src={`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_800/${thumbnail.public_id}.${thumbnail.format}`}
                  alt={`Thumbnail de ${displayName}`}
                  fill
                  placeholder="blur"
                  blurDataURL={thumbnail.blurDataUrl}
                  className={thumbnail.isPortrait ? 'object-contain bg-black' : 'object-cover'}
                />
              </div>
              <div className="p-4 text-center">
                <h2 className="text-lg font-semibold capitalize">{displayName}</h2>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="p-6 text-center text-white/80 sm:p-12">
        <a href="https://issacar.deco.site">Issacar Church</a> &copy; {date}
      </footer>
    </div>
  )
}
