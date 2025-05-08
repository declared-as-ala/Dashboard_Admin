// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // loose ESM externals so SWC will transform more node_modules
  experimental: { 
    esmExternals: "loose"
  },

  // Ensure Firebase and other problematic packages are transpiled
  transpilePackages: ["firebase"],

  // Use memory cache to avoid file system issues
  webpack(config) {
    // redirect any import of "undici" to Next's compiled copy
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: require.resolve("next/dist/compiled/undici"),
    };
    
    // Use memory cache to avoid file system issues
    config.cache = {
      type: 'memory'
    };
    
    return config;
  },
};

module.exports = nextConfig;