/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  swcMinify: true,

  experimental: {
    appDir: true // Garante uso do App Router
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**' // Permite qualquer imagem hospedada lá
      }
    ]
  },

  async rewrites() {
    return [
      {
        source: '/galeria/:slug/p/:photoId',
        destination: '/galeria/:slug?photoId=:photoId'
      }
    ]
  }
}

module.exports = nextConfig
