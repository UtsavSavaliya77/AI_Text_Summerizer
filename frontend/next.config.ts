import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure we don't leak server info
  poweredByHeader: false,
};

export default nextConfig;