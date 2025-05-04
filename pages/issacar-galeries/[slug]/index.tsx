import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import cloudinary from '../../../utils/cloudinary';
import getBase64ImageUrl from '../../../utils/generateBlurPlaceholder';
import type { ImageProps } from '../../../utils/types';
import { useRouter } from 'next/router';
import { useLastViewedPhoto } from '../../../utils/useLastViewedPhoto';
import { useEffect, useRef } from 'react';
import Modal from '../../../components/Modal';
import Logo from '../../../components/Icons/Logo';

interface Props {
  images: ImageProps[];
  slug: string;
}

const GalleryPage: NextPage<Props> = ({ images, slug }) => {

  const router = useRouter();
    const { photoId } = router.query;
    const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();

    const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // This effect keeps track of the last viewed photo in the modal to keep the index page in sync when the user navigates back
    if (lastViewedPhoto && !photoId) {
      lastViewedPhotoRef.current.scrollIntoView({ block: "center" });
      setLastViewedPhoto(null);
    }
  }, [photoId, lastViewedPhoto, setLastViewedPhoto]);
  return (


    <>
      <Head>
        <title>Issacar Pictures BETA¹</title>
      </Head>
      <main className="mx-auto max-w-[1960px] p-4">
        {photoId && (
          <Modal
            images={images}
            slug={slug}
            onClose={() => {
              setLastViewedPhoto(photoId);
            }}
          />
        )}
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
          <div className="after:content relative mb-5 flex h-[629px] flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="flex max-h-full max-w-full items-center justify-center">
              </span>
              <span className="absolute left-0 right-0 bottom-0 h-[400px] bg-gradient-to-b from-black/0 via-black to-black"></span>
            </div>
            <Logo />
            <h1 className="mt-8 mb-4 text-base font-bold uppercase tracking-widest">
              Issacar Pictures Beta¹
            </h1>
            <p className="max-w-[40ch] text-white/75 sm:max-w-[32ch]">
              Esse aplicativo é um piloto para o nosso site, onde você poderá visualizar as fotos dos cultos da Igreja. você pode sugerir melhorias que serão consideradas
              no lançamento oficial no site.
            </p>
            <a
              className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-4"
              href="https://wa.me/5511941234567?text=Oi%,%20quero%20saber%20mais%20sobre%20o%20aplicativo%20de%20fotos%20e%20fazer%20sugestões!"
              target="_blank"
              rel="noreferrer"
            >
              Sugerir uma melhoria.
            </a>
          </div>
          {images.map(({ id, public_id, format, blurDataUrl }) => (
            <Link
              key={id}
              href={`/issacar-galeries/${slug}/?photoId=${id}`}
              ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
              shallow
              className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
            >
              <Image
                alt="Next.js Conf photo"
                className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                style={{ transform: "translate3d(0, 0, 0)" }}
                placeholder="blur"
                blurDataURL={blurDataUrl}
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_720/${public_id}.${format}`}
                width={720}
                height={480}
                sizes="(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw"
              />
            </Link>
          ))}
        </div>
      </main>
      <footer className="p-6 text-center text-white/80 sm:p-12">
        <a href="https://issacar.deco.site">Issacar Church</a> &copy; {new Date().getFullYear()}{" "}
      </footer>

    </>
  );
};

export default GalleryPage;

export const getStaticPaths: GetStaticPaths = async () => {
  const { folders } = await cloudinary.v2.api.sub_folders(process.env.CLOUDINARY_ROOT_FOLDER || '');

  const paths = folders.map((folder: any) => ({
    params: { slug: folder.name },
  }));

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  const results = await cloudinary.v2.search
    .expression(`folder:${slug}/*`)
    .sort_by('public_id', 'desc')
    .max_results(400)
    .execute();

  let images: ImageProps[] = [];
  let i = 0;

  for (let result of results.resources) {
    images.push({
      id: i++,
      height: result.height,
      width: result.width,
      public_id: result.public_id,
      format: result.format,
    });
  }

  const blurImagePromises = images.map((image: ImageProps) => getBase64ImageUrl(image));
  const imagesWithBlurDataUrls = await Promise.all(blurImagePromises);

  for (let i = 0; i < images.length; i++) {
    images[i].blurDataUrl = imagesWithBlurDataUrls[i];
  }

  return {
    props: {
      images,
      slug,
    },
    revalidate: 60, // Revalida a cada minuto
  };
};