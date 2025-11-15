# 🚀 Supabase Setup Guide for Hack the Gap

This guide will help you configure your Hack the Gap application to use Supabase as your PostgreSQL database.

## 📋 Prerequisites

- A Supabase account (free tier works great for development)
- Node.js 20+ installed
- pnpm package manager installed

## 🎯 Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `hack-the-gap` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
   - **Pricing Plan**: Free tier is sufficient for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for your project to be provisioned

## 🔑 Step 2: Get Your Connection Strings

### Option A: Connection Pooler (Recommended for Production)

1. In your Supabase project, go to **Project Settings** (gear icon)
2. Click **Database** in the left sidebar
3. Scroll to **Connection string** section
4. Select **URI** tab
5. **Enable "Use connection pooling"** toggle
6. Copy the connection string - it looks like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual database password

### Option B: Direct Connection (For Development)

1. In the same **Connection string** section
2. **Disable "Use connection pooling"** toggle
3. Copy the direct connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

## 🔧 Step 3: Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist):

```bash
# Copy from .env.example
cp .env.example .env
```

2. Add your Supabase connection strings to `.env`:

```bash
# Database - Supabase Connection Pooler (Recommended)
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection for migrations (required by Prisma)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Auth (Generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET="your-generated-secret-here"
BETTER_AUTH_URL="http://localhost:3000"

# Email (Optional for development - emails will be logged to console)
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="noreply@hackthegap.com"

# OpenAI (Required for concept extraction)
OPENAI_API_KEY="sk-your-openai-key"

# Public
NEXT_PUBLIC_EMAIL_CONTACT="support@hackthegap.com"

# OAuth (Optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### Important Notes:

- **DATABASE_URL**: Use the connection pooler URL with `?pgbouncer=true` parameter
- **DIRECT_URL**: Use the direct connection URL (required for Prisma migrations)
- Both URLs should have your actual password replacing `[YOUR-PASSWORD]`

## 🗄️ Step 4: Initialize Your Database

### 4.1 Install Dependencies

```bash
pnpm install
```

### 4.2 Generate Prisma Client

```bash
pnpm prisma generate
```

### 4.3 Push Schema to Supabase

Instead of using migrations, we'll push the schema directly:

```bash
pnpm prisma db push
```

This will:
- Create all tables defined in your Prisma schema
- Set up relationships and indexes
- Configure the database structure

### 4.4 Seed the Database (Optional)

To populate your database with sample data:

```bash
pnpm prisma:seed
```

This will create:
- Sample subjects (Mathematics, Physics, etc.)
- Academic years and semesters
- Sample courses
- Test users (if configured)

## 🚀 Step 5: Start Development

```bash
pnpm dev
```

Your application will be available at: **http://localhost:3000**

## 🔍 Step 6: Verify Setup

### Check Database Connection

1. Open Prisma Studio to view your database:
```bash
pnpm prisma studio
```

2. Prisma Studio will open at **http://localhost:5555**
3. You should see all your tables populated

### Check Supabase Dashboard

1. Go to your Supabase project
2. Click **Table Editor** in the left sidebar
3. You should see all your tables:
   - `User`, `Session`, `Account` (Better Auth)
   - `Subject`, `Course`, `AcademicYear`, `Semester`
   - `Concept`, `Flashcard`, `ReviewSession`
   - And more...

## 🛠️ Common Commands

```bash
# Generate Prisma Client (after schema changes)
pnpm prisma generate

# Push schema changes to database
pnpm prisma db push

# Open Prisma Studio (database GUI)
pnpm prisma studio

# Seed database with sample data
pnpm prisma:seed

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🔐 Security Best Practices

### 1. Never Commit Secrets

Make sure `.env` is in your `.gitignore`:

```bash
# Check if .env is ignored
git check-ignore .env
```

### 2. Use Environment Variables in Production

For production deployment (Vercel, Netlify, etc.):
- Add all environment variables in your hosting platform's dashboard
- Never hardcode secrets in your code

### 3. Rotate Database Password

If you accidentally expose your password:
1. Go to Supabase Dashboard → Project Settings → Database
2. Click **"Reset database password"**
3. Update your `.env` file with the new password

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Solution:**
- Check your internet connection
- Verify your connection strings are correct
- Ensure your Supabase project is active (not paused)
- Check if your IP is allowed (Supabase allows all IPs by default)

### Error: "Prepared statement already exists"

**Solution:**
Add `?pgbouncer=true` to your `DATABASE_URL`:
```bash
DATABASE_URL="postgresql://...?pgbouncer=true"
```

### Error: "SSL connection required"

**Solution:**
Add `?sslmode=require` to your connection string:
```bash
DATABASE_URL="postgresql://...?sslmode=require"
```

### Prisma Migration Issues

**Solution:**
Use `prisma db push` instead of `prisma migrate dev` for development:
```bash
pnpm prisma db push
```

### Connection Pooling Issues

**Solution:**
- Use `DATABASE_URL` with pooler for application queries
- Use `DIRECT_URL` without pooler for migrations
- Make sure both are configured in your Prisma schema

## 📊 Monitoring Your Database

### Supabase Dashboard

1. **Database Health**: Project Settings → Database → Connection pooling
2. **Query Performance**: Database → Query Performance
3. **Table Size**: Database → Database → Table sizes
4. **Logs**: Logs → Postgres Logs

### Prisma Studio

```bash
pnpm prisma studio
```

- View and edit data
- Test relationships
- Debug data issues

## 🚀 Production Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL` (with pooler)
   - `DIRECT_URL` (direct connection)
   - `BETTER_AUTH_SECRET`
   - All other required variables
4. Deploy!

### Environment Variables for Production

```bash
# Use production Supabase project
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Generate new secret for production
BETTER_AUTH_SECRET="production-secret-here"
BETTER_AUTH_URL="https://your-domain.com"

# Production email service
RESEND_API_KEY="re_production_key"
EMAIL_FROM="noreply@your-domain.com"

# Production OpenAI key
OPENAI_API_KEY="sk-production-key"
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [Better Auth Documentation](https://better-auth.com)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## 💡 Tips

1. **Use Supabase Studio**: Great for quick data inspection and SQL queries
2. **Enable Row Level Security (RLS)**: For production, consider enabling RLS in Supabase
3. **Backup Your Data**: Supabase provides automatic backups on paid plans
4. **Monitor Usage**: Keep an eye on your database size and API requests
5. **Use Connection Pooling**: Always use the pooler URL for your application

## 🆘 Need Help?

- Check the [Supabase Discord](https://discord.supabase.com)
- Review [Prisma Discord](https://discord.gg/prisma)
- Open an issue in the project repository

---

**🎉 You're all set! Happy coding!**
