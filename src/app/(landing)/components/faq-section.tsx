"use client"

import { CircleHelp } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

type FaqItem = {
  value: string
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    value: 'item-1',
    question: 'How do I get started with FluxKit?',
    answer:
      'Clone the repository, run `bun install`, copy `.env.example` to `.env.local`, fill in your credentials, then run `bunx convex dev` and `bun dev` in separate terminals. You\'ll have a fully working SaaS app running locally within minutes.',
  },
  {
    value: 'item-2',
    question: 'What backend does FluxKit use, and why Convex?',
    answer:
      'FluxKit uses Convex as its serverless backend. Convex gives you real-time reactive queries, automatic database management, and TypeScript functions — no REST endpoints or GraphQL schema to write. Your UI automatically stays in sync with data changes without polling.',
  },
  {
    value: 'item-3',
    question: 'Does FluxKit include authentication and multi-tenancy?',
    answer:
      'Yes. Authentication is handled by Better Auth with support for email/password, magic links, social OAuth, and password resets. Organizations and team management are built in — you can invite members, assign roles, and handle multi-tenant data isolation out of the box.',
  },
  {
    value: 'item-4',
    question: 'Is billing and payments included?',
    answer:
      'Yes. FluxKit integrates with Polar for subscription billing and payment flows. You get subscription management, usage tracking, and checkout sessions wired up. Configure your Polar API key in your environment variables and you\'re ready to charge customers.',
  },
  {
    value: 'item-5',
    question: 'What is the full tech stack?',
    answer:
      'FluxKit is built with Next.js 16, React 19, Convex (backend), Better Auth (authentication), Polar (billing), Brevo (transactional email), shadcn/ui + Tailwind CSS 4 (UI), Sentry (error monitoring), Upstash Redis (rate limiting), and TypeScript throughout. All packages are managed with Bun.',
  },
  {
    value: 'item-6',
    question: 'Can I use FluxKit in commercial projects?',
    answer:
      'Absolutely. FluxKit is MIT licensed — use it freely in personal projects, client work, or commercial SaaS products with no attribution required. You own your code completely.',
  },
]

const FaqSection = () => {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about {siteConfig.name}. Still have questions? We&apos;re here to help!
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <div className='bg-transparent'>
            <div className='p-0'>
              <Accordion type='single' collapsible className='space-y-5'>
                {faqItems.map(item => (
                  <AccordionItem key={item.value} value={item.value} className='rounded-md !border bg-transparent'>
                    <AccordionTrigger className='cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-[state=open]:border-b'>
                      <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full'>
                          <CircleHelp className='size-5' />
                        </div>
                        <span className='text-start font-semibold'>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='p-4 bg-transparent'>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Support CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Still have questions? We&apos;re here to help.
            </p>
            <Button className='cursor-pointer' asChild>
              <a href="#contact">
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { FaqSection }
