import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  reactCompiler: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  outputFileTracingIncludes: {
    '**': ['./node_modules/.prisma/client/**/*'],
  },
};

export default nextConfig;
