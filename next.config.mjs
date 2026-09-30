/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint is run explicitly via `pnpm lint`; don't fail production builds on it.
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
