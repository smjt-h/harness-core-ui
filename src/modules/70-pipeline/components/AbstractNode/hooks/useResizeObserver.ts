import { throttle } from 'lodash-es'
import { useState, useEffect, useRef } from 'react'
import { getComputedPosition } from '../PipelineGraph/PipelineGraphUtils'

export interface ResizeObserverResult {
  shouldCollapse: boolean
  shouldExpand: boolean
}
export const useNodeResizeObserver = (
  selectorString: string,
  elementToCompare: Element | null
): ResizeObserverResult => {
  const [element, setElement] = useState<Element | null>(null)
  const [refElement, setRefElement] = useState<Element | null>(null)
  const [state, setState] = useState<ResizeObserverResult>({ shouldCollapse: false, shouldExpand: false })
  const observer = useRef<null | ResizeObserver>(null)
  const cleanup = (): void => {
    if (observer.current) {
      observer.current.disconnect()
    }
  }

  useEffect(() => {
    setRefElement(elementToCompare)
  }, [elementToCompare])

  useEffect(() => {
    setElement(document.querySelector(selectorString!) as HTMLElement)
  }, [selectorString])

  const onResize = throttle(([entry]) => {
    const finalData = isIntersectingBottomWhenResize(entry, refElement as Element, 50)
    setState(finalData)
  }, 100)

  useEffect(() => {
    if (!selectorString || !element) return
    cleanup()
    const ob = (observer.current = new ResizeObserver(onResize))
    ob.observe(element as Element)

    return () => {
      cleanup()
    }
  }, [element, refElement])

  return state
}

const checkIntersectionBottom = (entry: IntersectionObserverEntry): boolean => {
  return entry.boundingClientRect.bottom >= (entry.rootBounds as DOMRect)?.bottom
}

const isIntersectingBottomWhenResize = (
  entry: ResizeObserverEntry,
  el: Element,
  bottomPadding: number
): ResizeObserverResult => {
  const elementPos = getComputedPosition(el.id, entry.target as HTMLDivElement) as DOMRect
  const intersectingBottom = elementPos.bottom >= entry.contentRect.bottom
  const notIntersectingBottom = elementPos.bottom + bottomPadding >= entry.contentRect.bottom
  return { shouldCollapse: intersectingBottom, shouldExpand: notIntersectingBottom }
}
