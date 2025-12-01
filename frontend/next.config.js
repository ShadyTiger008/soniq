/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // // <CHANGE> Force rebuild and clear cache for Tailwind v4
  // webpack: (config, { isServer }) => {
  //   return config;
  // },
};

export default nextConfig;
