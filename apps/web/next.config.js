/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
  experimental: {
    optimizeCss: true,
    turbo: {
      loaders: {
        '.css': ['style-loader', 'css-loader', 'postcss-loader'],
      },
    },
  },
};

export default nextConfig;
