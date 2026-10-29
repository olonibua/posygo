const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const OFFICIAL_ORIGIN = "https://posygo.com";
const FORMER_HOSTS = ["posygo.vercel.app", "www.posygo.com"];

const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  htmlLimitedBots: /.*/,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/:path*", has: [{ type: "host", value: "(?<preview>.+)\\.vercel\\.app" }], headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  async redirects() {
    return [
      { source: "/guides/keeping-stock-safe-at-a-fulfilment-hub", destination: "/guides/keeping-your-stock-safe", permanent: true },
      ...FORMER_HOSTS.map((host) => ({ source: "/:path*", has: [{ type: "host", value: host }], destination: `${OFFICIAL_ORIGIN}/:path*`, permanent: true })),
    ];
  },
  async rewrites() {
    return apiProxyTarget ? [{ source: "/v1/:path*", destination: `${apiProxyTarget}/v1/:path*` }] : [];
  },
};

export default nextConfig;
