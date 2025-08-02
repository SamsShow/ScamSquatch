/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
  experimental: {
    optimizeCss: true
  }
};

export default nextConfig;
