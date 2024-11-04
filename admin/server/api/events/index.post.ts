import { EventPayload } from '~/types/events'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<EventPayload>(event)
    
    // Log the received payload
    console.log('Received payload:', JSON.stringify(body, null, 2))

    const { sessionId, websiteId, events } = body

    if (!sessionId || !websiteId || !Array.isArray(events)) {
      console.error('Invalid payload structure:', { sessionId, websiteId, events })
      throw createError({
        statusCode: 400,
        message: 'Invalid payload structure. Required: sessionId, websiteId, and events array'
      })
    }

    // Get the Prisma client from the event context
    const prisma = event.context.prisma
    
    if (!prisma) {
      console.error('Prisma client not found in context')
      throw createError({
        statusCode: 500,
        message: 'Database connection not available'
      })
    }

    try {
      // Ensure the session exists or create it
      const session = await prisma.session.upsert({
        where: { id: sessionId },
        update: {}, // No updates needed if it exists
        create: {
          id: sessionId,
          websiteId,
        },
      })

      console.log('Session upserted:', session)

      // Batch insert all events
      const eventsToCreate = events.map(eventData => ({
        sessionId: session.id,
        type: eventData.type,
        data: eventData.data,
        timestamp: new Date(eventData.timestamp)
      }))
      console.log('Events to create: ', eventsToCreate)

      const createdEvents = await prisma.event.createMany({
        data: eventsToCreate
      })

      // console.log('Events created:', createdEvents)

      return {
        status: 'success',
        sessionId: session.id,
        eventsProcessed: events.length
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError)
      throw createError({
        statusCode: 500,
        message: 'Database operation failed',
        cause: dbError
      })
    }
  } catch (error: any) {
    console.error('Error processing events:', error)
    
    // If it's already a handled error, rethrow it
    if (error.statusCode) {
      throw error
    }

    // Otherwise, create a new error
    throw createError({
      statusCode: 500,
      message: `Failed to process events: ${error.message}`
    })
  }
})