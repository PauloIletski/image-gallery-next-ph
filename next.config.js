module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // permite qualquer caminho
      },
    ],
  },
async rewrites() {
  return [
    {
      source: '/galeria/:slug/p/:photoId',
      destination: '/galeria/:slug?photoId=:photoId',
    },
  ];
},

  
};
