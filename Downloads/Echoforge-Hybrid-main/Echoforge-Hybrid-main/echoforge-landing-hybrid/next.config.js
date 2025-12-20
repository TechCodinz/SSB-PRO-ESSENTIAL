/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Optimize build traces - FIXES HANGING BUILD!
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/@prisma/client/**/*'],
    },
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild',
        'node_modules/webpack',
        'node_modules/terser',
      ],
    },
  },

  // Optimize output
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Environment variables validation
  env: {
    NEXT_PUBLIC_ECHOFORGE_API_URL: process.env.NEXT_PUBLIC_ECHOFORGE_API_URL,
    NEXT_PUBLIC_ECHOFORGE_APP_URL: process.env.NEXT_PUBLIC_ECHOFORGE_APP_URL,
    NEXT_PUBLIC_ECHOFORGE_API_KEY: process.env.NEXT_PUBLIC_ECHOFORGE_API_KEY,
  },

  // Image optimization - OPTIMIZED!
  images: {
    domains: ['echoforge.com', 'localhost', 'vercel.app'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Webpack optimization
  webpack: (config, { isServer }) => {
    const path = require('path')
    // Optimize build performance
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };

    // Resolve app-relative imports (fixes module-not-found for '@/...' and 'lib/...')
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname),
      lib: path.resolve(__dirname, 'lib'),
      components: path.resolve(__dirname, 'components'),
      app: path.resolve(__dirname, 'app'),
    }

    // Exclude heavy packages from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Headers for CORS and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
