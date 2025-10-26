/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
  transpilePackages: ["@fitnest/db"],   // 👈 important en monorepo
};
module.exports = nextConfig;
