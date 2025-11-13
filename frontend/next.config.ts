import type { NextConfig } from 'next';

const nextConfig: NextConfig = {

    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8080/api/:path*',
            },
        ];
    },

    images: {
        unoptimized: true,
        // TODO: Adicionar remotePatterns quando for para produção
    },
};

export default nextConfig;