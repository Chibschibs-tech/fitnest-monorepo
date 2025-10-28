/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
  transpilePackages: ['@fitnest/db'],
};
module.exports = nextConfig;
