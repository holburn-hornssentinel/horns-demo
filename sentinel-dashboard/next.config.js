/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
    NEXT_PUBLIC_HORNSIQ_URL: process.env.NEXT_PUBLIC_HORNSIQ_URL || 'http://192.168.1.160:3978',
  },
}

module.exports = nextConfig
