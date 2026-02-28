# Convex ShipFast

A production-ready SaaS boilerplate built with modern technologies to help you ship your product faster. Built with Next.js 16, React 19, Convex, Better Auth, and shadcn/ui.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Authentication & Authorization**
  - Multiple sign-in layouts and flows
  - Email verification and magic links
  - Password reset functionality
  - Session management with Better Auth
  - Organization/team support

- **Dashboard & UI**
  - Modern, responsive dashboard layout
  - Task management system
  - Calendar integration
  - Analytics and metrics
  - Settings and preferences
  - Theme customization (light/dark mode)

- **Billing & Subscriptions**
  - Integrated with Polar for payments
  - Subscription management
  - Usage tracking

- **Notifications**
  - Real-time notifications system
  - Email notifications via Brevo

- **Developer Experience**
  - TypeScript for type safety
  - ESLint for code quality
  - Hot reload in development
  - Comprehensive error pages

- **Production Ready**
  - Error monitoring with Sentry
  - Rate limiting with Upstash Redis
  - Analytics integration (Umami, Rybbit)
  - SEO optimized

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)
![Convex](https://img.shields.io/badge/Convex-1.32-orange?style=flat)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=flat&logo=tailwind-css)
![Bun](https://img.shields.io/badge/Bun-latest-black?style=flat&logo=bun)

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Convex (serverless backend)
- **Authentication**: Better Auth
- **Billing**: Polar
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS 4
- **Email**: Brevo
- **Monitoring**: Sentry
- **Rate Limiting**: Upstash Redis
- **Package Manager**: Bun

## Prerequisites

Before you begin, ensure you have the following installed:

- **Bun** >= 1.0.0 ([Install Bun](https://bun.sh))
- **Node.js** >= 18.0.0 (for compatibility)
- **Git**

## Quick Start

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd convex-shipfast
```

2. **Install dependencies**

```bash
bun install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration values (see [Environment Variables](#environment-variables) section).

4. **Set up Convex**

```bash
bunx convex dev
```

This will:
- Create a new Convex project (or link to existing)
- Set up your `NEXT_PUBLIC_CONVEX_URL` automatically
- Start the Convex development server

5. **Start the development server**

In a new terminal:

```bash
bun dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SITE_URL=http://localhost:3000

# Better Auth (Required)
# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your_super_secret_string_here
```

### Convex (Auto-configured)

```env
# These are set automatically by `bunx convex dev`
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
```

### Email Configuration (Brevo)

```env
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_NAME="Your App Name"
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_REPLY_TO_EMAIL=support@yourdomain.com
BREVO_REPLY_TO_NAME="Your App Support"

# Email Templates (create in Brevo dashboard)
BREVO_TEMPLATE_EMAIL_VERIFICATION=1
BREVO_TEMPLATE_PASSWORD_RESET=2
BREVO_TEMPLATE_MAGIC_LINK=3
BREVO_TEMPLATE_INVITE=4
BREVO_TEMPLATE_WELCOME=5
```

### Optional Services

```env
# Sentry (Error Monitoring)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development

# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GROK_API_KEY=

# Analytics
NEXT_PUBLIC_ANALYTICS_PROVIDER=none
NEXT_PUBLIC_ANALYTICS_SITE_ID=
NEXT_PUBLIC_ANALYTICS_HOST=

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

See `.env.example` for the complete list with detailed comments.

## Development Workflow

### Running the Development Server

You need to run both Convex and Next.js in development:

**Terminal 1 - Convex Backend:**
```bash
bunx convex dev
```

**Terminal 2 - Next.js Frontend:**
```bash
bun dev
```

### Type Checking

```bash
bun typecheck
```

### Linting

```bash
bun lint
```

### Building for Production

```bash
bun build
```

## Project Structure

```
convex-shipfast/
├── convex/                 # Convex backend functions
│   ├── auth.ts            # Authentication logic
│   ├── schema.ts          # Database schema
│   └── ...                # Other backend functions
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/       # Authentication pages
│   │   ├── (dashboard)/  # Dashboard pages
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard routes
│   │   └── landing/      # Landing page
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── layouts/      # Layout components
│   │   ├── landing/      # Landing page components
│   │   └── providers/    # Context providers
│   ├── config/            # Configuration files
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   │   └── auth/         # Auth utilities
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
├── public/                # Static assets
├── .env.example           # Environment variables template
├── .env.local             # Your local environment (gitignored)
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Start the Next.js development server |
| `bun build` | Build the application for production |
| `bun start` | Start the production server |
| `bun lint` | Run ESLint to check code quality |
| `bun typecheck` | Run TypeScript type checking |
| `bunx convex dev` | Start Convex development server |
| `bunx convex deploy` | Deploy Convex functions to production |

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - Add all required environment variables from `.env.example`
   - Make sure to set product URLs

4. **Deploy Convex**

```bash
bunx convex deploy
```

Copy the production `CONVEX_URL` and add it to Vercel environment variables.

5. **Redeploy on Vercel**

After setting the Convex URL, trigger a new deployment.

### Other Platforms

This project can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- Self-hosted with Docker

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for platform-specific guides.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:
- Passes type checking (`bun typecheck`)
- Passes linting (`bun lint`)
- Follows the existing code style
- Includes appropriate tests if applicable

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using [Convex](https://convex.dev), [Next.js](https://nextjs.org), and [shadcn/ui](https://ui.shadcn.com)
