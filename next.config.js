const path = require('path')
/** @type {import('next').NextConfig} */

module.exports = {
    output: 'export', // ✅ enables static export
  images: {
    loader: 'custom',
    unoptimized: true, // disable built-in image optimization
  },
  eslint: {
        ignoreDuringBuilds: true,
        // target:'serverless',
    },
  trailingSlash: true,
  reactStrictMode: false,
  experimental: {
    esmExternals: false,
    jsconfigPaths: true // enables it for both jsconfig.json and tsconfig.json
  },
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    return config
  }
}
