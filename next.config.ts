import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disabled for now - requires babel-plugin-react-compiler
    // reactCompiler: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig; 