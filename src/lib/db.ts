// This file is UNUSED and kept only for reference.
// The application uses Supabase (src/lib/supabase-store.ts) as its data layer.
// The Prisma schema (prisma/schema.prisma) contains a default User/Post template
// that does NOT match the academic department schema used by the application.
// All database operations go through Supabase client and API routes.
//
// To remove completely, also delete:
//   - prisma/schema.prisma
//   - db/custom.db
//   - @prisma/client and prisma from package.json
//   - db:* scripts from package.json

// import { PrismaClient } from '@prisma/client'
//
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined
// }
//
// export const db =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: ['query'],
//   })
//
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
