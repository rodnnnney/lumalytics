import { redirect } from 'next/dist/server/api-utils';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/dashboard',
  //       permanent: false,
  //     },
  //   ];
  // },
  transpilePackages: [
    'debug',
    'supports-color',
    'engine.io-client',
    'socket.io-client',
    'socket.io-parser',
  ],
  webpack: (config: { resolve: { fallback: any } }) => {
    // Add a rule to handle ESM modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
};

module.exports = nextConfig;
