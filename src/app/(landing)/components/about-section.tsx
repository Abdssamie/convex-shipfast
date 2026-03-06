"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CardDecorator } from '@/components/ui/card-decorator'
import { Github, Zap, ShieldCheck, Database, Code2 } from 'lucide-react'
import { siteConfig } from '@/config/site'

const values = [
  {
    icon: Code2,
    title: 'Developer First',
    description: 'Every decision is made with DX in mind — TypeScript throughout, clean structure, and zero magic.'
  },
  {
    icon: ShieldCheck,
    title: 'Auth You Can Trust',
    description: 'Better Auth gives you a battle-tested authentication system with email, OAuth, and magic links.'
  },
  {
    icon: Database,
    title: 'Real-time Backend',
    description: 'Convex powers a reactive serverless backend — your UI stays in sync automatically.'
  },
  {
    icon: Zap,
    title: 'Production Ready',
    description: 'Ships with Sentry, rate limiting, transactional email, and billing pre-configured.'
  }
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            About {siteConfig.name}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Built by developers, for developers
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            FluxKit is an opinionated SaaS starter kit that eliminates the setup tax.
            We&apos;ve made the hard choices so you can focus on what makes your product unique.
          </p>
        </div>

        {/* Modern Values Grid with Enhanced Design */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 mb-12">
          {values.map((value, index) => (
            <Card key={index} className='group shadow-xs py-2'>
              <CardContent className='p-8'>
                <div className='flex flex-col items-center text-center'>
                  <CardDecorator>
                    <value.icon className='h-6 w-6' aria-hidden />
                  </CardDecorator>
                  <h3 className='mt-6 font-medium text-balance'>{value.title}</h3>
                  <p className='text-muted-foreground mt-3 text-sm'>{value.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="cursor-pointer" asChild>
              <a href="https://fluxkit.dev/docs" target="_blank" rel="noopener noreferrer">
                Read the Docs
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
