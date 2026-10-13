import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack otherwise walks up to C:\Users\linji and picks up a stray
  // package-lock.json as the project root, which makes it warn on every start.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
