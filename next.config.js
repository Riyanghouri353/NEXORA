/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/overview',
        permanent: false,
      },
      {
        source: '/dashboard/settings',
        destination: '/dashboard/settings/profile',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
