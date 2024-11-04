<script setup lang="ts">
import { formatDistanceToNow, format } from 'date-fns'
import type { ReplayEvent, PlaybackState, MousePosition, ScrollPosition } from '~/types/replay'

const replayFrame = ref<HTMLIFrameElement | null>(null)
const currentSnapshot = ref<string>('')
const currentDOMSnapshot = ref<any>(null)

// Get session ID from route
const route = useRoute()
const sessionId = route.params.id as string

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

// Initialize iframe content when a DOM snapshot is encountered
const initializeReplayFrame = (html: string) => {
  if (!replayFrame.value) return

  const frameDoc = replayFrame.value.contentDocument
  if (!frameDoc) return

  // Write the captured HTML to the iframe
  frameDoc.open()
  frameDoc.write(html)
  frameDoc.close()

  // Add custom styles for cursor visualization
  const style = frameDoc.createElement('style')
  style.textContent = `
    .replay-cursor {
      position: fixed;
      width: 10px;
      height: 10px;
      background: red;
      border-radius: 50%;
      pointer-events: none;
      transition: all 0.1s ease;
      z-index: 999999;
    }

    .replay-click {
      position: fixed;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid red;
      animation: click-effect 0.5s ease-out;
      pointer-events: none;
      z-index: 999999;
    }

    @keyframes click-effect {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }
  `

  frameDoc.head.appendChild(style)
}

const applyEvents = (events: ReplayEvent[]) => {
  if (!replayFrame.value) return

  const frameDoc = replayFrame.value.contentDocument
  if (!frameDoc) return

  // Apply the latest mouse and scroll positions from the events
  events.forEach(event => {
    switch (event.type) {
      case 'domSnapshot':
        currentDOMSnapshot.value = event.data
        initializeReplayFrame(event.data.html)
        break

      case 'mouseMove':
        let cursor = frameDoc.querySelector('.replay-cursor')
        if (!cursor) {
          cursor = frameDoc.createElement('div')
          cursor.className = 'replay-cursor'
          frameDoc.body.appendChild(cursor)
        }
        cursor.style.transform = `translate(${event.data.x}px, ${event.data.y}px)`
        break

      case 'click':
        const clickEffect = frameDoc.createElement('div')
        clickEffect.className = 'replay-click'
        clickEffect.style.left = `${event.data.x}px`
        clickEffect.style.top = `${event.data.y}px`
        frameDoc.body.appendChild(clickEffect)
        setTimeout(() => clickEffect.remove(), 500)
        break

      case 'scroll':
        if (frameDoc.defaultView) {
          frameDoc.defaultView.scrollTo(event.data.scrollX, event.data.scrollY)
        }
        break
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
          class="w-full h-full"
          sandbox="allow-same-origin"
          :style="{
            pointerEvents: 'none',
            backgroundColor: 'white'
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
</style>