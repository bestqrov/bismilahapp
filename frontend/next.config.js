/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    optimizeFonts: false,
    images: {
        unoptimized: true,
        domains: ['localhost'],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:3000/api/:path*',
            },
        ];
    },
}

module.exports = nextConfig
