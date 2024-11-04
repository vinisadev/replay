<script setup lang="ts">
import { formatDistanceToNow, format } from 'date-fns'
import type { ReplayEvent, PlaybackState, MousePosition, ScrollPosition } from '~/types/replay'

// Get session ID from route
const route = useRoute()
const sessionId = route.params.id as string
const replayFrame = ref<HTMLIFrameElement | null>(null)
const currentSnapshot = ref<string>('')
const currentDOMSnapshot = ref<any>(null)
const cursor = ref<HTMLDivElement | null>(null)

// Fetch session data
const { data, error } = await useFetch(`/api/sessions/${sessionId}`)

// Playback state
const playbackState = reactive<PlaybackState>({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  speed: 1
})

// Cursor and scroll position state
const cursorPosition = ref<MousePosition>({ x: 0, y: 0 })
const scrollPosition = ref<ScrollPosition>({ x: 0, y: 0 })

// Computed properties
const events = computed(() => data.value?.events || [])
const session = computed(() => data.value?.session)

const formattedCurrentTime = computed(() => {
  return format(playbackState.currentTime, 'mm:ss.SSS')
})

const formattedDuration = computed(() => {
  return format(playbackState.duration, 'mm:ss.SSS')
})

const progress = computed(() => {
  if (playbackState.duration === 0) return 0
  return (playbackState.currentTime / playbackState.duration) * 100
})

// Initialize playback when events are loaded
onMounted(() => {
  if (events.value.length > 0) {
    const firstEvent = events.value[0]
    const lastEvent = events.value[events.value.length - 1]
    playbackState.duration = new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime()
    playbackState.currentTime = 0
  }
})

// Playback controls
const togglePlayback = () => {
  playbackState.isPlaying = !playbackState.isPlaying
  if (playbackState.isPlaying) {
    startPlayback()
  }
}

const startPlayback = () => {
  if (!events.value.length) return

  const startTime = Date.now() - playbackState.currentTime
  const firstEventTime = new Date(events.value[0].timestamp).getTime()

  const animate = () => {
    if (!playbackState.isPlaying) return

    const currentRealTime = Date.now()
    const newCurrentTime = (currentRealTime - startTime) * playbackState.speed

    if (newCurrentTime >= playbackState.duration) {
      playbackState.isPlaying = false
      playbackState.currentTime = playbackState.duration
      return
    }

    playbackState.currentTime = newCurrentTime
    
    // Find and apply events that should have happened by now
    const currentEventTime = firstEventTime + newCurrentTime
    const relevantEvents = events.value.filter(event => {
      const eventTime = new Date(event.timestamp).getTime()
      return eventTime <= currentEventTime
    })

    applyEvents(relevantEvents)
    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}

// Inject cursor styles and create cursor element in the iframe
const setupReplayFrame = (frameDoc: Document) => {
  console.log('Setting up replay frame')
  
  // Remove any existing style elements we've added
  const existingStyle = frameDoc.querySelector('#replay-styles')
  if (existingStyle) {
    existingStyle.remove()
  }

  // Add styles
  const styleEl = frameDoc.createElement('style')
  styleEl.id = 'replay-styles'
  styleEl.textContent = `
    .replay-cursor {
      width: 20px;
      height: 20px;
      background: rgba(255, 0, 0, 0.5);
      border: 2px solid red;
      border-radius: 50%;
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      transition: transform 0.1s ease;
    }

    .replay-click {
      position: fixed;
      width: 40px;
      height: 40px;
      border: 2px solid red;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999998;
      opacity: 0;
      animation: click-ripple 0.5s ease-out forwards;
    }

    @keyframes click-ripple {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(0.5);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(2);
      }
    }
  `
  frameDoc.head.appendChild(styleEl)

  // Create cursor element if it doesn't exist
  let cursor = frameDoc.querySelector('.replay-cursor')
  if (!cursor) {
    cursor = frameDoc.createElement('div')
    cursor.className = 'replay-cursor'
    frameDoc.body.appendChild(cursor)
    console.log('Cursor element created')
  }

  // Create a container for the content
  let container = frameDoc.querySelector('#replay-container')
  if (!container) {
    container = frameDoc.createElement('div')
    container.id = 'replay-container'
    container.style.position = 'relative'
    container.style.minHeight = '100vh'
    frameDoc.body.appendChild(container)
  }

  console.log('Replay frame setup completed')
}

// Initialize iframe content when a DOM snapshot is encountered
const initializeReplayFrame = (html: string) => {
  if (!replayFrame.value) {
    console.error('No replay frame reference')
    return
  }
  
  const frameDoc = replayFrame.value.contentDocument
  if (!frameDoc) {
    console.error('No frame document')
    return
  }

  console.log('Initializing replay frame with HTML')

  // Write the HTML to the iframe
  frameDoc.open()
  
  // Wrap the content in a basic HTML structure
  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;">
        ${html}
      </body>
    </html>
  `
  
  frameDoc.write(wrappedHtml)
  frameDoc.close()

  // Setup cursor and styles after the frame is loaded
  frameDoc.addEventListener('DOMContentLoaded', () => {
    setupReplayFrame(frameDoc)
  })
  
  // Backup: also try to setup after a short delay
  setTimeout(() => {
    setupReplayFrame(frameDoc)
  }, 100)
}

const createClickEffect = (frameDoc: Document, x: number, y: number) => {
  const ripple = frameDoc.createElement('div')
  ripple.className = 'replay-click'
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  frameDoc.body.appendChild(ripple)

  // Remove the ripple element after animation
  setTimeout(() => ripple.remove(), 500)
}

const applyEvents = (events: ReplayEvent[]) => {
  if (!replayFrame.value) return
  const frameDoc = replayFrame.value.contentDocument
  if (!frameDoc) return

  events.forEach(event => {
    switch (event.type) {
      case 'domSnapshot': {
        console.log('Applying DOM snapshot')
        initializeReplayFrame(event.data.html)
        break
      }

      case 'mouseMove': {
        const cursor = frameDoc.querySelector('.replay-cursor')
        if (cursor) {
          cursor.style.transform = `translate(${event.data.x}px, ${event.data.y}px)`
        } else {
          console.log('Cursor not found, attempting to recreate')
          setupReplayFrame(frameDoc)
        }
        break
      }

      case 'click': {
        console.log('Click event at', event.data.x, event.data.y)
        const ripple = frameDoc.createElement('div')
        ripple.className = 'replay-click'
        ripple.style.left = `${event.data.x}px`
        ripple.style.top = `${event.data.y}px`
        frameDoc.body.appendChild(ripple)
        setTimeout(() => ripple.remove(), 500)
        break
      }

      case 'scroll': {
        frameDoc.defaultView?.scrollTo({
          left: event.data.scrollX,
          top: event.data.scrollY,
          behavior: 'smooth'
        })
        break
      }
    }
  })
}

const setProgress = (e: Event) => {
  const target = e.target as HTMLInputElement
  const percentage = Number(target.value)
  playbackState.currentTime = (playbackState.duration * percentage) / 100
}

const setSpeed = (speed: number) => {
  playbackState.speed = speed
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="border-b border-gray-200 pb-5">
      <div class="sm:flex sm:items-baseline sm:justify-between">
        <div class="sm:w-0 sm:flex-1">
          <h1 class="text-xl font-semibold leading-6 text-gray-900">
            Session Replay
          </h1>
          <p class="mt-1 max-w-2xl text-sm text-gray-500" v-if="session">
            Started {{ formatDistanceToNow(new Date(session.startedAt), { addSuffix: true }) }}
          </p>
        </div>
        <div class="mt-4 flex sm:ml-4 sm:mt-0">
          <NuxtLink
            to="/"
            class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to Sessions
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Replay viewport -->
    <div class="relative bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
      <!-- Replay canvas -->
      <div class="aspect-video relative overflow-hidden">

        <!-- Replay iFrame -->
        <iframe
          ref="replayFrame"
          class="w-full h-full bg-white"
          sandbox="allow-same-origin"
          :style="{
            pointerEvents: 'none',
          }"
        ></iframe>
      </div>

      <!-- Playback controls -->
      <div class="px-4 py-3 border-t border-gray-200">
        <div class="flex items-center space-x-4">
          <!-- Play/Pause button -->
          <button
            @click="togglePlayback"
            class="rounded-full p-2 hover:bg-gray-100"
          >
            <span v-if="playbackState.isPlaying" class="i-lucide-pause w-5 h-5" />
            <span v-else class="i-lucide-play w-5 h-5" />
          </button>

          <!-- Time display -->
          <div class="text-sm text-gray-500">
            {{ formattedCurrentTime }} / {{ formattedDuration }}
          </div>

          <!-- Progress bar -->
          <div class="flex-1">
            <input
              type="range"
              :value="progress"
              @input="setProgress"
              class="w-full"
              min="0"
              max="100"
              step="0.1"
            >
          </div>

          <!-- Playback speed -->
          <div class="flex items-center space-x-2">
            <button
              v-for="speed in [0.5, 1, 2, 4]"
              :key="speed"
              @click="setSpeed(speed)"
              class="px-2 py-1 text-sm rounded"
              :class="{
                'bg-indigo-600 text-white': playbackState.speed === speed,
                'text-gray-700 hover:bg-gray-100': playbackState.speed !== speed
              }"
            >
              {{ speed }}x
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Event timeline -->
    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
      <div class="px-4 py-3 border-b border-gray-200">
        <h3 class="text-sm font-medium text-gray-900">Events</h3>
      </div>
      <div class="divide-y divide-gray-200 max-h-64 overflow-y-auto">
        <div
          v-for="event in events"
          :key="event.id"
          class="px-4 py-2 flex items-center text-sm"
          :class="{
            'bg-indigo-50': new Date(event.timestamp).getTime() <= playbackState.currentTime + new Date(events[0].timestamp).getTime()
          }"
        >
          <span class="text-gray-500 w-24">
            {{ format(new Date(event.timestamp), 'mm:ss.SSS') }}
          </span>
          <span class="font-medium text-gray-900 w-24">{{ event.type }}</span>
          <span class="text-gray-500 truncate">
            {{ JSON.stringify(event.data) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="range"] {
  @apply appearance-none bg-gray-200 h-1 rounded-full;
}

input[type="range"]::-webkit-slider-thumb {
  @apply appearance-none w-3 h-3 bg-indigo-600 rounded-full cursor-pointer;
}

input[type="range"]::-moz-range-thumb {
  @apply appearance-none w-3 h-3 bg-indigo-600 rounded-full cursor-pointer border-0;
}

.replay-cursor.clicking {
  background: rgba(255, 0, 0, 0.8);
  transform: translate(-50%, -50%) scale(0.8);
}
</style>