import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Carousel from "../../../../components/Carousel";
import type { ImageProps } from "../../../../utils/types";
import { loadGallerySlugs } from "../../../../lib/galleryCache";
import { fetchGalleryImages } from "../../../../utils/fetchGalleryImages";
import { Analytics } from "@vercel/analytics/next";

const Home: NextPage = ({ currentPhoto }: { currentPhoto: ImageProps }) => {
  const router = useRouter();
  const { photoId } = router.query;
  let index = Number(photoId);

  const currentPhotoUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_2560/${currentPhoto.public_id}.${currentPhoto.format}`;

  return (
    <>
      <Head>
        <title>Issacar Images</title>
        <meta property="og:image" content={currentPhotoUrl} />
        <meta name="twitter:image" content={currentPhotoUrl} />
      </Head>
      <Analytics />
      <main className="mx-auto max-w-[1960px] p-4">
        <Carousel currentPhoto={currentPhoto} index={index} />
      </main>
    </>
  );
};

export default Home;



export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await loadGallerySlugs();
  const paths: { params: { slug: string; photoId: string } }[] = [];

  for (const slug of slugs) {
    const images = await fetchGalleryImages(slug);
    images.forEach((_, index) => {
      paths.push({
        params: {
          slug,
          photoId: index.toString(),
        },
      });
    });
  }

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const photoId = params?.photoId as string;

  const images = await fetchGalleryImages(slug);
  const currentPhoto = images[parseInt(photoId)];

  if (!currentPhoto) {
    return { notFound: true };
  }

  return {
    props: {
      currentPhoto,
    },
    revalidate: 60,
  };
};
