# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the "Neighbor Pharmacist" (옆집약사) website project - a healthcare platform focused on providing cancer patients with lifestyle guidance, dietary advice, latest cancer information, and consultation services.

## Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database operations
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio for database management
npm run db:generate  # Generate Prisma client
```

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Prisma ORM with MariaDB/MySQL
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: Radix UI primitives for accessibility
- **Forms**: React Hook Form with Zod validation
- **Payment**: Toss Payments SDK
- **Icons**: Lucide React

### Project Structure

```text
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (REST endpoints)
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard pages
│   ├── inquiry/           # Inquiry board pages
│   ├── supplements/       # Product/supplement pages
│   └── [other routes]/    # Other application pages
├── components/            # React components
│   ├── ui/               # Reusable UI components (Radix-based)
│   ├── features/         # Feature-specific components
│   ├── layout/           # Layout components
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client instance
│   └── [other utils]/    # Utility functions
└── hooks/                # Custom React hooks
```

### Database Models

Key models include:

- **User**: User accounts with role-based access (USER/ADMIN) and expert designation
- **Inquiry**: Q&A posts with optional password protection for sensitive medical information
- **Comment**: Comments on inquiries with user associations
- **Content**: CMS content with categories (LIFESTYLE/TREATMENT/NOTICE)
- **Product**: E-commerce products with inventory management
- **Order/OrderItem**: E-commerce orders with Toss payment integration
- **HeroImage**: Homepage carousel images with ordering and activation
- **Notice**: Site notices and announcements

### Authentication & Authorization

- Uses NextAuth.js with JWT strategy for scalability
- Custom credentials provider with bcrypt password hashing
- Role-based access control (USER/ADMIN roles)
- Expert user designation for healthcare professionals
- Middleware protection for `/admin` and `/my` routes
- Extended session types include role and expert status

### Key Features Implementation

- **File Uploads**: Custom implementation for medical document attachments
- **Password-Protected Posts**: Inquiry system with optional password protection for sensitive medical information
- **E-commerce**: Full shopping cart and checkout with Toss Payments integration
- **CMS**: Content management for lifestyle advice and treatment information
- **Admin Dashboard**: Complete CRUD operations for all content types with statistics
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Radix UI components for screen reader support

### API Structure

All API routes follow RESTful conventions under `/api`:
- `/api/auth` - Authentication endpoints
- `/api/inquiries` - Inquiry CRUD operations
- `/api/content` - CMS content management
- `/api/products` - Product management
- `/api/orders` - Order processing
- `/api/payments` - Toss Payments integration
- `/api/admin` - Admin-specific operations
- `/api/comments` - Comment system
- `/api/user` - User profile management

### Important Considerations

- Medical information requires special security considerations
- Always use password protection for sensitive inquiries
- File uploads should validate medical document types
- Maintain accessibility standards for healthcare users
- Test payment flows in Toss test environment before production
- Use Prisma transactions for order processing to ensure data consistency

### File Upload Implementation

- Image uploads for products and hero images go to `/public/uploads/`
- Medical document attachments for inquiries stored as JSON array in database
- Custom upload endpoints: `/api/upload`, `/api/upload/hero-images`, `/api/upload/content`
- File validation implemented for security and type checking

### Environment Variables

Key environment variables required:
- `DATABASE_URL` - MySQL/MariaDB connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret for JWT signing
- `NEXTAUTH_URL` - Base URL for authentication callbacks
- `TOSS_CLIENT_KEY` - Toss Payments client key
- `TOSS_SECRET_KEY` - Toss Payments secret key

### Code Conventions

- Uses `@/` path alias for imports from `src/` directory
- TypeScript strict mode enabled
- Prisma client accessed via `@/lib/db`
- Authentication logic centralized in `@/lib/auth.ts`
- Form validation with Zod schemas in `@/lib/validations.ts`
- UI components follow Radix UI + Tailwind CSS patterns
- API routes return standardized JSON responses with proper HTTP status codes