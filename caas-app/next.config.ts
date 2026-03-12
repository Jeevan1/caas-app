import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: "./messages/en/common.json",
  },
});

const API_BASE = process.env.MASTER_URL!;

const domain = API_BASE.replace(/^https?:\/\//, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [domain, "lh3.googleusercontent.com"],
  },
};

export default withNextIntl(nextConfig);
