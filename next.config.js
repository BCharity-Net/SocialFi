/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs')
const withTM = require('next-transpile-modules')(['plyr-react'])
const { withAxiom } = require('next-axiom')

const headers = [{ key: 'Cache-Control', value: 'public, max-age=3600' }]

module.exports = withAxiom(
  withTM(
    withSentryConfig(
      {
        reactStrictMode: false,
        trailingSlash: false,
        maximumFileSizeToCacheInBytes: 8000000,
        async rewrites() {
          return [
            {
              source: '/sitemap.xml',
              destination: 'https://sitemap.bcharity.net/sitemap.xml'
            },
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
                { key: 'Permissions-Policy', value: 'interest-cohort=()' },
                { key: 'Access-Control-Allow-Credentials', value: 'true' },
                { key: 'Access-Control-Allow-Origin', value: '*' },
                {
                  key: 'Access-Control-Allow-Methods',
                  value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT'
                },
                {
                  key: 'Access-Control-Allow-Headers',
                  value:
                    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
                }
              ]
            },
            { source: '/about', headers },
            { source: '/privacy', headers },
            { source: '/thanks', headers }
          ]
        }
      },
      { silent: true } // Sentry config
    )
  )
)
