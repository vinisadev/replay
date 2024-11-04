export interface BaseEventData {
  timestamp: number;
}

export interface MouseMoveEvent extends BaseEventData {
  type: 'mouseMove';
  data: {
    x: number;
    y: number;
  };
}

export interface ClickEvent extends BaseEventData {
  type: 'click';
  data: {
    x: number;
    y: number;
    target: string;
  };
}

export interface ScrollEvent extends BaseEventData {
  type: 'scroll';
  data: {
    scrollX: number;
    scrollY: number;
  };
}

export type EventData = MouseMoveEvent | ClickEvent | ScrollEvent;

export interface EventPayload {
  sessionId: string;
  websiteId: string;
  events: EventData[];
}