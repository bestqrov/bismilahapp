/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    optimizeFonts: false,
    // output: 'export',  // Commented out for development
    // distDir: 'dist',   // Commented out for development
    images: {
        unoptimized: true,
        domains: ['localhost'],
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
