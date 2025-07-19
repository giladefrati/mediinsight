# MediInsight

MediInsight is an AI-powered web application that helps users make sense of their medical documents. Users can upload medical documents (PDFs, images, or text) and leverage OCR and AI to get document summaries, key insights, health overviews, medical timelines, and suggested questions for their healthcare providers.

## Tech Stack

### Frontend

- **[Next.js 15](https://nextjs.org)** - React framework with App Router and Turbopack for fast development
- **[React 19](https://react.dev)** - UI library with latest features and server components
- **[TypeScript 5](https://www.typescriptlang.org)** - Type-safe JavaScript development
- **[Tailwind CSS v4](https://tailwindcss.com)** - Utility-first CSS framework for styling
- **[shadcn/ui](https://ui.shadcn.com)** - Modern component library built on Radix UI primitives
- **[Radix UI](https://www.radix-ui.com)** - Low-level accessible UI primitives
- **[Lucide React](https://lucide.dev)** & **[Tabler Icons](https://tabler.io/icons)** - Icon libraries
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme switching (dark/light mode)

### Backend & Database

- **[Node.js](https://nodejs.org)** - Runtime environment via Next.js API routes
- **[PostgreSQL](https://www.postgresql.org)** - Primary relational database
- **[TypeORM](https://typeorm.io)** - Object-Relational Mapping with decorators
- **[Firebase](https://firebase.google.com)** - Backend-as-a-Service platform
  - **Firebase Auth** - User authentication with Google OAuth
  - **Firebase Firestore** - NoSQL document database for real-time data
  - **Firebase Storage** - File storage for uploaded documents
  - **Firebase Admin SDK** - Server-side Firebase operations
- **[react-firebase-hooks](https://github.com/CSFrequency/react-firebase-hooks)** - React hooks for Firebase integration
- **[reflect-metadata](https://github.com/rbuckton/reflect-metadata)** - Decorator metadata reflection for TypeORM

### AI & Document Processing

- **[Google Cloud Vision API](https://cloud.google.com/vision)** - Primary OCR for text extraction from images/PDFs
- **[Tesseract.js](https://tesseract.projectnaptha.com)** - Fallback OCR solution
- **OpenAI GPT-4** - AI analysis integration (planned)

### UI Components & Libraries

- **[Recharts](https://recharts.org)** - Chart and data visualization library
- **[@tanstack/react-table](https://tanstack.com/table)** - Data table management
- **[@dnd-kit](https://dndkit.com)** - Drag and drop functionality
- **[class-variance-authority](https://cva.style/docs)** - Component variant management
- **[clsx](https://github.com/lukeed/clsx)** & **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Conditional CSS class utilities
- **[date-fns](https://date-fns.org)** - Date manipulation and formatting
- **[Sonner](https://sonner.emilkowal.ski)** - Toast notifications
- **[Vaul](https://vaul.emilkowal.ski)** - Drawer component for mobile
- **[Zod](https://zod.dev)** - Schema validation

### Development Tools

- **[ESLint](https://eslint.org)** - Code linting and formatting
- **[PostCSS](https://postcss.org)** - CSS processing
- **[PNPM](https://pnpm.io)** - Fast, disk space efficient package manager
- **[dotenv](https://github.com/motdotla/dotenv)** - Environment variable management
- **[tw-animate-css](https://github.com/kenwheeler/tw-animate-css)** - Additional Tailwind CSS animations
- **Turbopack** - Next.js build tool for faster development

### Deployment & Infrastructure

- **[Vercel](https://vercel.com)** - Hosting platform optimized for Next.js
- **Google Cloud Platform** - Cloud services for Vision API
- **Firebase Hosting** - Additional hosting option for static assets

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # Backend API endpoints
│   ├── dashboard/         # Dashboard page and data
│   └── layout.tsx         # Root layout component
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── providers/        # Context providers (auth, theme)
│   └── ui/               # shadcn/ui components
├── entities/             # TypeORM entity definitions
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── services/             # Business logic and external API calls
└── types/                # TypeScript type definitions
```

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Set up environment variables by creating a `.env.local` file with your API keys and configuration.

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Key Features

- **Document Upload & Processing** - Upload medical documents in various formats
- **OCR Text Extraction** - Automatic text extraction from images and PDFs
- **AI-Powered Analysis** - Intelligent document analysis (in development)
- **Document Summaries** - Concise, human-readable summaries (planned)
- **Health Insights** - Key findings and important medical information (planned)
- **Medical Timeline** - Chronological view of medical events (planned)
- **Suggested Questions** - Questions to ask healthcare providers (planned)
- **User Authentication** - Secure login with Google OAuth
- **Data Persistence** - Store and retrieve previous documents and analyses

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [shadcn/ui](https://ui.shadcn.com) - component library documentation
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework
- [Firebase Documentation](https://firebase.google.com/docs) - backend services
- [TypeORM Documentation](https://typeorm.io) - database ORM

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
