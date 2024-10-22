/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["mongoose"], // Moved from experimental
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
