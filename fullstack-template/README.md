# Full-Stack Template

A minimal, modern full-stack template with Next.js, Prisma, and JWT authentication.

## Features

- **Frontend**: Next.js with React and TypeScript
- **Backend**: Next.js API routes
- **Database**: Prisma with SQLite
- **Authentication**: JWT with bcrypt password hashing
- **UI**: Tailwind CSS for styling
- **Roles**: User and Admin roles

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Make (optional but recommended)

### Installation & Launch

**Method 1: Using Make (Recommended)**

```bash
make install  # Build and start the project
```

The app will be available at `http://localhost:3000`.

**Note:** First build may take 3-5 minutes due to npm install and Docker image creation.

**Method 2: Using Docker Compose directly**

```bash
docker compose up --build
```

### Main Commands

All commands use Docker by default:

```bash
make install    # Build and start project in background
make dev        # Start project with logs (Ctrl+C to stop)
make start      # Start in background
make stop       # Stop containers
make logs       # View logs
make shell      # Open shell in container
make db-studio  # Open Prisma Studio
make clean      # Stop and remove everything
```

### Local Development (without Docker)

If you prefer to run locally with Node.js installed:

```bash
make local-install  # Install dependencies
make local-db-push  # Set up database
make local-dev      # Start development server
```

## Project Structure

```
fullstack-template/
├── lib/
│   ├── auth.ts          # Authentication utilities
│   └── middleware.ts    # API middleware
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   └── register.ts
│   │   └── users/
│   │       └── me.ts
│   ├── dashboard.tsx    # Protected dashboard page
│   ├── index.tsx        # Home page (redirects to login/dashboard)
│   ├── login.tsx        # Login page
│   └── register.tsx     # Registration page
├── prisma/
│   └── schema.prisma    # Database schema
├── .env.example         # Environment variables template
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
├── Makefile             # Make commands
├── next.config.js       # Next.js configuration
├── package.json         # Dependencies and scripts
├── README.md            # This file
└── tsconfig.json        # TypeScript configuration
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Users

- `GET /api/users/me` - Get current user info (requires auth)

## Database Schema

### User

- `id`: String (CUID)
- `email`: String (unique)
- `password`: String (hashed)
- `name`: String (optional)
- `role`: Role (USER | ADMIN)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Session

- `id`: String (CUID)
- `userId`: String
- `token`: String (unique)
- `expiresAt`: DateTime
- `createdAt`: DateTime

## Why This Structure?

This template follows a modular monolith architecture inspired by ADR-0001, with clear separation between frontend, backend, and database layers. It prioritizes simplicity and extensibility:

- **Frontend**: Pages for login, register, and dashboard with client-side routing
- **Backend**: API routes handling authentication and user management
- **Database**: Prisma schema with minimal models for users and sessions
- **Auth**: JWT-based authentication with role-based access control

## How to Take It in Hand Quickly?

1. **Setup**: Run `make install`
2. **Access**: Open `http://localhost:3000`
3. **Register**: Create an account at `/register`
4. **Login**: Access the dashboard at `/dashboard`
5. **Extend**: Add new models, routes, or pages as needed

**Useful commands:**
- `make logs` - View application logs
- `make shell` - Access container shell
- `make stop` - Stop the application
- `make clean` - Clean everything

## How to Extend Easily?

### Add a New Prisma Model

1. Update `prisma/schema.prisma`:

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())

  @@map("posts")
}
```

2. Add relation to User model:

```prisma
model User {
  // ... existing fields
  posts Post[]
}
```

3. Run `npx prisma db push`

### Add a New Role

1. Update the Role enum in `prisma/schema.prisma`:

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR  // New role
}
```

2. Run `npx prisma db push`

### Add a New API Route

1. Create `pages/api/posts/index.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const posts = await prisma.post.findMany();
    res.status(200).json(posts);
  } else if (req.method === 'POST') {
    const { title, content, authorId } = req.body;
    const post = await prisma.post.create({
      data: { title, content, authorId },
    });
    res.status(201).json(post);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

### Add a New Page

1. Create `pages/posts.tsx`:

```tsx
import { useState, useEffect } from 'react';

interface Post {
  id: string;
  title: string;
  content: string;
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(setPosts);
  }, []);

  return (
    <div>
      <h1>Posts</h1>
      {posts.map(post => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}
```

## Environment Variables

Copy `.env.example` to `.env` and update:

- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Secret key for JWT signing
- `NEXTAUTH_URL`: Next.js auth URL (for production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (if any)
5. Submit a pull request

## License

MIT
