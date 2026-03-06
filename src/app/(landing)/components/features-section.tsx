"use client"

import {
  Zap,
  Users,
  ArrowRight,
  Database,
  ShieldCheck,
  CreditCard,
  Mail,
  Activity,
  Lock,
  Code2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Image3D } from '@/components/image-3d'

const mainFeatures = [
  {
    icon: ShieldCheck,
    title: 'Better Auth',
    description: 'Email + password, magic links, social OAuth, and password reset — fully configured.'
  },
  {
    icon: Users,
    title: 'Organizations & Teams',
    description: 'Invite members, manage roles, and handle multi-tenant access out of the box.'
  },
  {
    icon: Database,
    title: 'Convex Backend',
    description: 'Real-time serverless backend with reactive queries — no REST endpoints to write.'
  },
  {
    icon: Zap,
    title: 'Real-time by Default',
    description: 'Data updates propagate instantly across all clients with zero polling or websockets setup.'
  }
]

const secondaryFeatures = [
  {
    icon: CreditCard,
    title: 'Billing with Polar',
    description: 'Subscription management, usage tracking, and checkout flows wired up and ready.'
  },
  {
    icon: Mail,
    title: 'Transactional Email',
    description: 'Brevo integration for verification, magic links, invitations, and password resets.'
  },
  {
    icon: Activity,
    title: 'Error Monitoring',
    description: 'Sentry configured for both client-side and server-side error tracking.'
  },
  {
    icon: Lock,
    title: 'Rate Limiting',
    description: 'Upstash Redis integration to protect API routes from abuse.'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">What&apos;s Included</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything you need to ship production SaaS
          </h2>
          <p className="text-lg text-muted-foreground">
            FluxKit wires up all the hard parts — authentication, billing, real-time data, email, and monitoring — so you can focus on building your product.
          </p>
        </div>

        {/* First Feature Section */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16 mb-24">
          {/* Left Image */}
          <Image3D
            lightSrc="/feature-1-light.png"
            darkSrc="/feature-1-dark.png"
            alt="Authentication and organization management"
            direction="left"
          />
          {/* Right Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Auth & teams, fully configured
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                Better Auth handles email/password, magic links, social OAuth, and password resets. Organizations with member invites and role management are built in.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {mainFeatures.map((feature, index) => (
                <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer" asChild>
                <a href="/sign-up" className='flex items-center'>
                  Get Started
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer" asChild>
                <a href="https://fluxkit.dev/docs" target="_blank" rel="noopener noreferrer">
                  <Code2 className="mr-2 size-4" />
                  View Docs
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Second Feature Section - Flipped Layout */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
          {/* Left Content */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Billing, email & monitoring included
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                Polar handles subscriptions and checkout. Brevo sends transactional emails. Sentry catches errors. Upstash Redis rate-limits your APIs. All pre-configured.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {secondaryFeatures.map((feature, index) => (
                <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer" asChild>
                <a href="https://fluxkit.dev/docs" target="_blank" rel="noopener noreferrer" className='flex items-center'>
                  View Documentation
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer" asChild>
                <a href="https://github.com/get-convex/convex-shipfast" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <Image3D
            lightSrc="/feature-2-light.png"
            darkSrc="/feature-2-dark.png"
            alt="Billing and monitoring dashboard"
            direction="right"
            className="order-1 lg:order-2"
          />
        </div>
      </div>
    </section>
  )
}
