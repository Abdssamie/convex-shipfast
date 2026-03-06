"use client"

import { ArrowRight, Rocket, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className='py-16 lg:py-24 bg-muted/80'>
      <div className='container mx-auto px-4 lg:px-8'>
        <div className='mx-auto max-w-4xl'>
          <div className='text-center'>
            <div className='space-y-8'>
              {/* Badge and Stats */}
              <div className='flex flex-col items-center gap-4'>
                <Badge variant='outline' className='flex items-center gap-2'>
                  <Rocket className='size-3' />
                  Open Source Boilerplate
                </Badge>

                <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                  <span className='flex items-center gap-1'>
                    <div className='size-2 rounded-full bg-green-500' />
                    MIT Licensed
                  </span>
                  <Separator orientation='vertical' className='!h-4' />
                  <span>10+ Integrations</span>
                  <Separator orientation='vertical' className='!h-4' />
                  <span>100% TypeScript</span>
                </div>
              </div>

              {/* Main Content */}
              <div className='space-y-6'>
                <h2 className='text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl'>
                  Ship your SaaS in
                  <span className='flex sm:inline-flex justify-center'>
                    <span className='relative mx-2'>
                      <span className='bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                        days
                      </span>
                      <div className='absolute start-0 -bottom-2 h-1 w-full bg-gradient-to-r from-primary/30 to-secondary/30' />
                    </span>
                    not months
                  </span>
                </h2>

                <p className='text-muted-foreground mx-auto max-w-2xl text-balance lg:text-xl'>
                  Stop spending weeks on auth, billing, and infrastructure.
                  FluxKit gives you a production-ready Convex + Next.js boilerplate so you can ship on day one.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className='flex flex-col justify-center gap-4 sm:flex-row sm:gap-6'>
                <Button size='lg' className='cursor-pointer px-8 py-6 text-lg font-medium' asChild>
                  <Link href='/sign-up'>
                    <Rocket className='me-2 size-5' />
                    Get Started Free
                  </Link>
                </Button>
                <Button variant='outline' size='lg' className='cursor-pointer px-8 py-6 text-lg font-medium group' asChild>
                  <a href='https://github.com/get-convex/convex-shipfast' target='_blank' rel='noopener noreferrer'>
                    <Github className='me-2 size-5' />
                    View on GitHub
                    <ArrowRight className='ms-2 size-4 transition-transform group-hover:translate-x-1' />
                  </a>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className='text-muted-foreground flex flex-wrap items-center justify-center gap-6 text-sm'>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-green-600 dark:bg-green-400 me-1' />
                  <span>MIT licensed, free forever</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-blue-600 dark:bg-blue-400 me-1' />
                  <span>Powered by Convex</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-purple-600 dark:bg-purple-400 me-1' />
                  <span>Deploy to Vercel in minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
