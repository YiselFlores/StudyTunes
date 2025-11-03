/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Allow Spotify + YouTube iframes
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              // child frames (embeds)
              "frame-src https://open.spotify.com https://www.youtube.com 'self'",
              // make sure we can call their APIs
              "connect-src 'self' https://api.spotify.com https://accounts.spotify.com https://open.spotify.com"
            ].join('; ')
          },
          // Some browsers still look at this
          { key: 'X-Frame-Options', value: 'ALLOWALL' }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
