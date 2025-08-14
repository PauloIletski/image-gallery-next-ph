import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          {/* <link rel="icon" href="/favicon.ico" /> */}
          <meta
            name="description"
            content="O novo album da Issacar Church"
          />
          <meta property="og:site_name" content="nextjsconf-pics.vercel.app" />
          <meta
            property="og:description"
            content="O novo album da Issacar Church"
          />
          <meta property="og:title" content="Issacar Pictures Beta¹" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Issacar Pictures Beta¹" />
          <meta
            name="twitter:description"
            content="O novo album da Issacar Church"
          />
        </Head>
        <body className="bg-black antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
