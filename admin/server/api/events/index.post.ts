import { EventPayload } from '~/types/events'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<EventPayload>(event)
    const { sessionId, websiteId, events } = body

    // Get the Prisma client from the event context
    const prisma = event.context.prisma

    // Ensure the session exists or create it
    const session = await prisma.session.upsert({
      where: { id: sessionId },
      update: {}, // No updates needed if it exists
      create: {
        id: sessionId,
        websiteId,
      },
    })

    // Batch insert all events
    const eventsToCreate = events.map(eventData => ({
      sessionId: session.id,
      type: eventData.type,
      data: eventData.data,
      timestamp: new Date(eventData.timestamp)
    }))

    await prisma.event.createMany({
      data: eventsToCreate
    })

    return {
      status: 'success',
      sessionId: session.id,
      eventsProcessed: events.length
    }
  } catch (error) {
    console.error('Error processing events: ', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to process events'
    })
  }
})