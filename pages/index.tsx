import type { NextPage } from "next";
import Head from "next/head";

import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import type { ImageProps } from "../utils/types";
import { useLastViewedPhoto } from "../utils/useLastViewedPhoto";

const Home: NextPage = ({ images }: { images: ImageProps[] }) => {
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
        <>
          <div>
            Futura home
          </div>
        </>
      </main>
      <footer className="p-6 text-center text-white/80 sm:p-12">
        <a href="https://issacar.deco.site">Issacar Church</a> &copy; {new Date().getFullYear()}{" "}
      </footer>
    </>
  );
};

export default Home;


