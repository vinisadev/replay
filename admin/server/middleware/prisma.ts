import { getPrismaClient } from '../utils/prisma'

export default defineEventHandler((event) => {
  event.context.prisma = getPrismaClient()
})