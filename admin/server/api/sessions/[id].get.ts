export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Session ID is required'
    })
  }

  const prisma = event.context.prisma

  try {
    const [session, events] = await Promise.all([
      // Fetch session details
      prisma.session.findUnique({
        where: { id }
      }),
      // Fetch all events for the session
      prisma.event.findMany({
        where: { sessionId: id },
        orderBy: { timestamp: 'asc' }
      })
    ])

    if (!session) {
      throw createError({
        statusCode: 404,
        message: 'Session not found'
      })
    }

    return {
      session,
      events
    }
  } catch (error) {
    console.error('Error fetching session details:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch session details'
    })
  }
})