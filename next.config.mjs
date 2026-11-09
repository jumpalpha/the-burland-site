/** @type {import('next').NextConfig} */
export default {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};
