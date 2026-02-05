/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose', 'pdf-parse'],
  turbopack: {},
};

export default nextConfig;
