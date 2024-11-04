import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

declare module 'h3' {
  interface H3EventContext {
    prisma: PrismaClient
  }
}

export function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}