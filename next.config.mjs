/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    // Chat screenshot / screen-record frames are uploaded through Server
    // Actions; the default 1MB limit is too small for image payloads.
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
