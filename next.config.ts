import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.paystack.com https://js.paystack.co https://vercel.live https://*.vercel.live",
              "style-src 'self' 'unsafe-inline' https://checkout.paystack.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://checkout.paystack.com",
              "connect-src 'self' https://checkout.paystack.com https://api.paystack.co https://mentorverseapi-production.up.railway.app https://vercel.live https://*.vercel.live wss://*.pusher.com",
              "frame-src 'self' https://checkout.paystack.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
