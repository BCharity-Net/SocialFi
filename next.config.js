const { withSentryConfig } = require('@sentry/nextjs')
const withTM = require('next-transpile-modules')(['plyr-react'])

const sentryWebpackPluginOptions = {
  silent: true
}

const headers = [{ key: 'Cache-Control', value: 'public, max-age=3600' }]

module.exports = withTM(
  withSentryConfig(
    {
      reactStrictMode: true,
      trailingSlash: false,
      maximumFileSizeToCacheInBytes: 5000000,
      async rewrites() {
        return [
          {
            source: '/sitemaps/:match*',
            destination: 'https://sitemap.bcharity.net/sitemaps/:match*'
          }
        ]
      },
      async redirects() {
        return [
          {
            source: '/discord',
            destination: 'https://discord.com/invite/4vKS59q5kV',
            permanent: true
          },
          {
            source: '/donate',
            destination: 'https://gitcoin.co/grants/5008/bcharity',
            permanent: true
          }
        ]
      },
      async headers() {
        return [
          {
            source: '/(.*)',
            headers: [
              { key: 'X-Content-Type-Options', value: 'nosniff' },
              { key: 'X-Frame-Options', value: 'DENY' },
              { key: 'X-XSS-Protection', value: '1; mode=block' },
              { key: 'Referrer-Policy', value: 'strict-origin' },
              { key: 'Permissions-Policy', value: 'interest-cohort=()' }
            ]
          },
          { source: '/about', headers },
          { source: '/privacy', headers },
          { source: '/thanks', headers }
        ]
      }
    },
    sentryWebpackPluginOptions
  )
)
