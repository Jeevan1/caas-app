import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: "./messages/en/common.json",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["wo-mac.batomechanic.com", "caas.batomechanic.com"],
  },
};

export default withNextIntl(nextConfig);
