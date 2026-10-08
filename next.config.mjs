/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      afterFiles: [
        // Keep the public product URL while resolving the existing App Router
        // pages. Runs after middleware, avoiding a rewrite → redirect loop.
        // The product home has its own /platform/deployment-control page.
        {
          source: "/platform/deployment-control/:path+",
          destination: "/:path+",
        },
      ],
    };
  },
  eslint: {
    // Lint is run explicitly via `pnpm lint`; don't fail production builds on it.
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
