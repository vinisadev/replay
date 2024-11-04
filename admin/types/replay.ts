export interface ReplayEvent {
  id: string
  sessionId: string
  type: string
  data: any
  timestamp: string
}

export interface PlaybackState {
  isPlaying: boolean
  currentTime: number
  duration: number
  speed: number
}

export interface MousePosition {
  x: number
  y: number
}

export interface ScrollPosition {
  x: number
  y: number
}