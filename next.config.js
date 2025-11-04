/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@google/generative-ai"],
  images: {
    domains: ["assets.aceternity.com"],
  },
};

module.exports = nextConfig;
