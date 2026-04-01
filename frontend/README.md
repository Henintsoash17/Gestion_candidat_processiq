# Candidate Management Frontend

A Next.js application for managing candidates with authentication, validation, and accessibility features.

## Features

- **Authentication**: JWT-based login system
- **Candidate Management**: CRUD operations for candidates
- **Validation**: Async validation with simulated delay
- **Pagination & Filters**: Search and filter candidates
- **Forms**: React Hook Form with Zod validation
- **Accessibility**: Axe-core integration for a11y testing
- **Responsive Design**: Tailwind CSS styling

## Prerequisites

- Node.js 18+
- Backend API running on http://localhost:3000

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3001](http://localhost:3001) (or next available port).

## API Endpoints

The frontend integrates with the following backend endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/candidates` - List candidates (with pagination/filters)
- `POST /api/candidates` - Create candidate
- `GET /api/candidates/:id` - Get candidate details
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Soft delete candidate
- `POST /api/candidates/:id/validate` - Async validation

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── candidates/         # Candidate pages
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout with providers
├── components/            # React components
│   ├── CandidateForm.tsx  # Create/edit form
│   ├── CandidateDetail.tsx # Detail view with validation
│   ├── CandidatesList.tsx # List with pagination/filters
│   ├── Login.tsx         # Login form
│   └── AccessibilityChecker.tsx # Axe-core integration
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication state
└── lib/                   # Utilities
    ├── api.ts            # API client
    └── types.ts          # TypeScript types
```

## Accessibility Testing

The application includes axe-core for automated accessibility testing. Violations are logged to the console during development.

## Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Axe-core** - Accessibility testing

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
