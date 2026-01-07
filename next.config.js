/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled due to Supabase auth conflicts with double-invocation
}

module.exports = nextConfig
