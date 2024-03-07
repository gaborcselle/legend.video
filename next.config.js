/** @type {import('next').NextConfig} */
module.exports = {

    webpack: (config, { dev }) => {
      // Enable source maps in development mode
      if (dev) {
        config.devtool = "source-map";
      }
  
      return config;
    },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'legend-video-outputs.public.blob.vercel-storage.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
      },
    ],
  }
}
