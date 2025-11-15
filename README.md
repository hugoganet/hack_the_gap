# Hack the Gap

AI-powered Zettelkasten that auto-converts students' passive content consumption into active long-term retention via concept extraction and spaced repetition.

> **🚀 HACKATHON MODE**: Ce template a été simplifié pour le hackathon. Consultez **[HACKATHON_QUICKSTART.md](./HACKATHON_QUICKSTART.md)** pour démarrer rapidement.

> **Note**: This project is built on the [NOW.TS](https://nowts.app) boilerplate template.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm package manager
- A Supabase account (free tier works great!)

### Installation

1. **Clone and install dependencies**:
   ```bash
   pnpm install
   ```

2. **Setup Supabase Database**:
   
   📚 **[Complete Supabase Setup Guide →](./SUPABASE_SETUP.md)**
   
   Quick steps:
   - Create a project at [Supabase Dashboard](https://app.supabase.com)
   - Get your connection strings from Project Settings → Database
   - Copy `.env.example` to `.env` and add your Supabase credentials

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your Supabase connection strings
   ```

4. **Initialize Database**:
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   pnpm prisma:seed  # Optional: Add sample data
   ```

5. **Start Development Server**:
   ```bash
   pnpm dev
   ```

The application will be available at **http://localhost:3000**

## 📋 Development Commands

```bash
# Development
pnpm dev            # Start development server (Turbopack)
pnpm build          # Build for production
pnpm start          # Start production server

# Database
pnpm prisma generate    # Generate Prisma Client
pnpm prisma db push     # Push schema to database
pnpm prisma studio      # Open Prisma Studio (database GUI)
pnpm prisma:seed        # Seed database with sample data

# Testing
pnpm test           # Run unit tests
pnpm test:e2e       # Run E2E tests
pnpm test:ci        # Run tests in CI mode

# Code Quality
pnpm lint           # Run ESLint
pnpm ts             # Type checking
pnpm clean          # Lint + type check + format
pnpm format         # Format code with Prettier
```

## 📦 Stack Technique

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Better Auth (email/password, OAuth)
- **Styling**: TailwindCSS v4 + Shadcn/UI
- **Email**: React Email + Resend
- **Testing**: Vitest + Playwright
- **Package Manager**: pnpm

## 📚 Documentation

- **[Supabase Setup Guide](./SUPABASE_SETUP.md)** - Complete database setup instructions
- **[Hackathon Quick Start](./HACKATHON_QUICKSTART.md)** - Fast-track development guide
- **[Agent IA Guide](./AGENTS.md)** - Instructions for Claude/Copilot
- **[Project Documentation](./documentation_starter_pack/README.md)** - Vision, architecture, ADRs
- **[NOW.TS Course](https://codeline.app/courses/clqn8pmte0001lr54itcjzl59/lessons/clqn8pz990003112iia11p7uo)** - Original template setup

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```bash
# Database - Supabase
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Auth
BETTER_AUTH_SECRET="..." # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"

# Email (Optional for development)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# AI - Required for concept extraction
OPENAI_API_KEY="sk-..."

# Public
NEXT_PUBLIC_EMAIL_CONTACT="support@hackthegap.com"
```

See `.env.example` for a complete template.

## 🤝 Contributions

Feel free to create a pull request with any changes you think valuable.

## 📄 License

See LICENSE.TXT for details.
