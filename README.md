# Next.js & Cloudinary example app

This example shows how to create an image gallery site using Next.js, [Cloudinary](https://cloudinary.com), and [Tailwind](https://tailwindcss.com).

## Deploy your own

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=next-example) or view the demo [here](https://nextconf-images.vercel.app/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/next.js/tree/canary/examples/with-cloudinary&project-name=nextjs-image-gallery&repository-name=with-cloudinary&env=NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET,CLOUDINARY_FOLDER&envDescription=API%20Keys%20from%20Cloudinary%20needed%20to%20run%20this%20application.)

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example with-cloudinary with-cloudinary-app
```

```bash
yarn create next-app --example with-cloudinary with-cloudinary-app
```

```bash
pnpm create next-app --example with-cloudinary with-cloudinary-app
```

## Setup

After cloning this repository install the required packages with `npm install`:

```bash
npm install
```

This will create a `node_modules` folder so TypeScript compilation with `npx tsc --noEmit` works without missing type definitions.

## References

- Cloudinary API: https://cloudinary.com/documentation/transformation_reference

## Google Drive access

When running in this Codex environment, attempts to call the Google Drive API may fail with a **Domain forbidden** error. This is returned by the network proxy and indicates outbound connections to Google are blocked, not an issue with the service account credentials.
