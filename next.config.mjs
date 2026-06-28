import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  outputFileTracingExcludes: {
    '/api/cms/**': [
      '.git/**',
      '.next/cache/**',
      'public/images/clients/**',
      'public/images/portfolio/**',
      'public/**/*.mp4',
      'public/**/*.pdf',
    ],
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(nextConfig);
