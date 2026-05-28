/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/scoping',
  images: { unoptimized: true },
  trailingSlash: true,
}

export default nextConfig
