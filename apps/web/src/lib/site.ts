export const siteConfig = {
  name: 'Rextensions',
  tagline: 'Manage and sync your Chrome extensions across browsers',
  description:
    'Rextensions is a Chrome extension that helps you manage installed extensions, export and import sync lists, and optionally back up your list with Google so you can restore it on another browser.',
  siteUrl: import.meta.env.PUBLIC_SITE_URL || 'https://rextensions-1d87a.web.app',
  cwsUrl: import.meta.env.PUBLIC_CWS_URL || '',
  githubUser: import.meta.env.PUBLIC_GITHUB_USER || 'rkanik',
  githubRepo: import.meta.env.PUBLIC_GITHUB_REPO || 'rkanik/rextensions',
  contactEmail: import.meta.env.PUBLIC_CONTACT_EMAIL || '',
}

export function absoluteUrl(path = '/') {
  const base = siteConfig.siteUrl.replace(/\/$/, '')
  if (!path || path === '/') return base + '/'
  return base + (path.startsWith('/') ? path : `/${path}`)
}

export const navProduct = [
  { href: '/features', label: 'Features' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/faq', label: 'FAQ' },
  { href: '/changelog', label: 'Changelog' },
]

export const navCommunity = [
  { href: '/contribute', label: 'Contribute' },
  { href: '/developer', label: 'Developer' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
]
