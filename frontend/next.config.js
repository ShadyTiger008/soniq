/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [

      {
        source: '/rooms',
        destination: '/explore',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
