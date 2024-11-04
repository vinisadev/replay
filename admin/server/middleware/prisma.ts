import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | null = null

export default defineEventHandler((event) => {
  if (!prisma) {
    prisma = new PrismaClient()
    console.log('Prisma client initialized')
  }
  
  event.context.prisma = prisma
  console.log('Prisma client attached to event context')
})