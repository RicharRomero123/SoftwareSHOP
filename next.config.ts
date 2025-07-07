/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'], // <--- AÑADE ESTA LÍNEA
  },
};

module.exports = nextConfig;