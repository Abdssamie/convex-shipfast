import type { Metadata } from 'next'
import { LandingPageContent } from './landing-page-content'
import { siteConfig } from '@/config/site'

const title = `${siteConfig.name} - ${siteConfig.tagline}`
const description = `${siteConfig.tagline}.`

// Metadata for the landing page
export const metadata: Metadata = {
  title,
  description,
  keywords: ['saas boilerplate', 'react', 'nextjs', 'typescript', 'tailwind css'],
  openGraph: {
    title,
    description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function LandingPage() {
  return <LandingPageContent />
}
