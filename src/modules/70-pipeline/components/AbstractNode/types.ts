import type { IconName } from '@harness/uicore'

export interface ListenerHandle {
  deregister: () => any
  id: string
  listener: BaseListener
}

export interface NodeData {
  name: string
  icon: IconName
  selectedColour: string
  unSelectedColour: string
  selectedIconColour: string
  unSelectedIconColour: string
}

export interface BaseEvent {
  firing: boolean
  stopPropagation: () => any
}

export interface BaseEventProxy extends BaseEvent {
  function: string
}

/**
 * Listeners are always in the form of an object that contains methods that take events
 */

export type BaseListener = {
  [key: string]: (event: BaseEvent) => any
}
