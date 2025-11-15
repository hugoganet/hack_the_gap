# Beta Invitations System

## Overview

This system collects and manages email addresses from users interested in beta access to the platform.

## Features

✅ **Email Collection Form** - Beautiful countdown timer with email signup on the homepage
✅ **Database Storage** - All emails are saved to PostgreSQL via Prisma
✅ **Duplicate Prevention** - System prevents duplicate email submissions
✅ **Admin Dashboard** - View and manage all beta invitation requests
✅ **Status Tracking** - Track invitation status (pending, invited, registered)

## Database Schema

```prisma
model BetaInvitation {
  id        String   @id @default(nanoid(11))
  email     String   @unique
  status    String   @default("pending") // pending, invited, registered
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([email])
  @@index([status])
}
```

## Setup Instructions

### 1. Database Migration

If you haven't run the migration yet, run:

```bash
npx prisma migrate dev --name add_beta_invitation
```

Or if you already have a database, generate the Prisma client:

```bash
npx prisma generate
```

### 2. Environment Variables

Make sure you have these variables in your `.env` file:

```env
DATABASE_URL="your_postgresql_connection_string"
DATABASE_URL_UNPOOLED="your_postgresql_direct_connection_string"
```

## Usage

### For Users

1. Visit the homepage at `/`
2. Scroll to the "Free Beta Test Ends" section
3. Enter your email address
4. Click "Get Invitation"
5. Receive confirmation toast message

### For Administrators

1. Navigate to `/admin/beta-invitations`
2. View statistics:
   - Total requests
   - Pending invitations
   - Invited users
   - Registered users
3. See full list of all email addresses with:
   - Email address
   - Current status
   - Request date
   - Last updated date

## API

### Server Action

**File:** `app/actions/beta-invitation.action.ts`

**Function:** `submitBetaInvitation(formData: FormData)`

**Parameters:**
- `formData` - FormData object containing the email

**Returns:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

**Example Usage:**
```typescript
const formData = new FormData();
formData.append("email", "user@example.com");

const result = await submitBetaInvitation(formData);

if (result.success) {
  console.log(result.message);
} else {
  console.error(result.error);
}
```

## Exporting Email List

To export all beta invitation emails, you can use Prisma Studio or run a query:

### Using Prisma Studio
```bash
npx prisma studio
```

### Using Node.js Script
```javascript
import { prisma } from "@/lib/prisma";

const emails = await prisma.betaInvitation.findMany({
  select: {
    email: true,
    status: true,
    createdAt: true,
  },
  orderBy: {
    createdAt: "desc",
  },
});

console.log(emails);
```

### Export to CSV
```javascript
import { prisma } from "@/lib/prisma";
import fs from "fs";

const invitations = await prisma.betaInvitation.findMany({
  orderBy: { createdAt: "desc" },
});

const csv = [
  "Email,Status,Created At,Updated At",
  ...invitations.map(i => 
    `${i.email},${i.status},${i.createdAt.toISOString()},${i.updatedAt.toISOString()}`
  )
].join("\n");

fs.writeFileSync("beta-invitations.csv", csv);
```

## Status Management

You can update invitation statuses programmatically:

```typescript
// Mark as invited
await prisma.betaInvitation.update({
  where: { email: "user@example.com" },
  data: { status: "invited" },
});

// Mark as registered
await prisma.betaInvitation.update({
  where: { email: "user@example.com" },
  data: { status: "registered" },
});
```

## Security Notes

- ✅ Email validation using Zod
- ✅ Duplicate prevention at database level (unique constraint)
- ✅ Server-side validation
- ✅ Rate limiting recommended for production

## Future Enhancements

- [ ] Email notification system
- [ ] Bulk invite sending
- [ ] Export to CSV from admin panel
- [ ] Search and filter functionality
- [ ] Status update UI in admin panel
- [ ] Analytics and charts
