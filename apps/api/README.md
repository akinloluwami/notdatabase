# API Next.js

This is a [Next.js](https://nextjs.org) API migrated from the Hono-based API in `apps/api`. It provides the same functionality using Next.js App Router API routes.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The API will be available at `http://localhost:3000/api/`.

## API Endpoints

### Collection Operations

- `GET /api/[collection]` - Get documents from a collection
- `POST /api/[collection]` - Create a new document
- `POST /api/[collection]/bulk` - Insert multiple documents
- `GET /api/[collection]/count` - Count documents in a collection
- `POST /api/[collection]/schema` - Save collection schema

### Document Operations

- `GET /api/[collection]/docs/[id]` - Get a specific document
- `PATCH /api/[collection]/docs/[id]` - Update a specific document
- `DELETE /api/[collection]/docs/[id]` - Delete a specific document

## Authentication

All endpoints require a valid API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

## Query Parameters

### GET /api/[collection]

- `limit` - Number of documents to return (default: 50)
- `offset` - Number of documents to skip (default: 0)
- `sort` - Field to sort by (prefix with `-` for descending)
- `filter[field]` - Filter by field value

### GET /api/[collection]/docs/[id]

- `select` - Comma-separated list of fields to return

### GET /api/[collection]/count

- `filter[field]` - Filter by field value

## Environment Variables

Make sure to set the following environment variables:

- `TURSO_DATABASE_URL` - Your Turso database URL
- `TURSO_AUTH_TOKEN` - Your Turso authentication token

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
