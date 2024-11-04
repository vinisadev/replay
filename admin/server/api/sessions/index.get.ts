export default defineEventHandler(async (event) => {
  const prisma = event.context.prisma
  const query = getQuery(event)

  // Parse pagination parameters
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const skip = (page - 1) * limit

  try {
    // Get total count for pagination
    const totalSessions = await prisma.session.count()

    // Fetch sessions with their event counts
    const sessions = await prisma.session.findMany({
      skip,
      take: limit,
      orderBy: {
        startedAt: 'desc'
      },
      include: {
        _count: {
          select: { events: true }
        }
      }
    })

    return {
      sessions: sessions.map(session => ({
        ...session,
        eventCount: session._count.events
      })),
      pagination: {
        total: totalSessions,
        page,
        pageSize: limit,
        pageCount: Math.ceil(totalSessions / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching sessions: ', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch sessions'
    })
  }
})