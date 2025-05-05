import { GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import cloudinary from '../utils/cloudinary';
import getBase64ImageUrl from '../utils/generateBlurPlaceholder';
import type { ImageProps } from '../utils/types';
import Head from 'next/head';

type FolderGallery = {
  slug: string;
  displayName: string;
  thumbnail: ImageProps;
};

interface Props {
  galleries: FolderGallery[];
}

const HomePage: NextPage<Props> = ({ galleries }) => {
  return (
    <>
      <Head>
        <title>Issacar Pictures BETA¹</title>
      </Head>
      <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-white text-3xl font-bold mb-8">Galerias da Issacar 📸</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {galleries.map(({ slug, displayName, thumbnail }) => (
          <Link
            href={`/issacar-galeries/${slug}`}
            key={slug}
            className="block rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition"
          >
            <div className="relative w-full aspect-[3/2]">
              <Image
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_800/${thumbnail.public_id}.${thumbnail.format}`}
                alt={`Thumbnail de ${displayName}`}
                fill
                placeholder="blur"
                blurDataURL={thumbnail.blurDataUrl}
                className="object-cover"
              />
            </div>
            <div className="p-4 text-center">
              <h2 className="text-lg font-semibold capitalize">
                {displayName}
              </h2>
            </div>
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

export default HomePage;

export const getStaticProps: GetStaticProps = async () => {
  const { folders } = await cloudinary.v2.api.sub_folders(process.env.CLOUDINARY_ROOT_FOLDER || '');

  const galleries: FolderGallery[] = [];

  for (const folder of folders) {
    const slug = folder.name;

    const result = await cloudinary.v2.search
      .expression(`folder:galeries/${slug}/*`)
      .sort_by('public_id', 'desc')
      .max_results(1)
      .execute();

    const image = result.resources[0];
    if (!image) continue;

    const thumbnail: ImageProps = {
      id: 0,
      height: image.height,
      width: image.width,
      public_id: image.public_id,
      format: image.format,
      blurDataUrl: await getBase64ImageUrl(image),
    };

    galleries.push({
      slug,
      displayName: slug.replace(/_/g, ' '),
      thumbnail,
    });
  }

  return {
    props: {
      galleries,
    },
    revalidate: 300,
  };
};
