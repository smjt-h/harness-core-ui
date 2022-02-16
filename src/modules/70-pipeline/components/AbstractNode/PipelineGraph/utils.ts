import type { RefObject } from 'react'
import type { StageElementWrapperConfig } from 'services/cd-ng'
const INITIAL_ZOOM_LEVEL = 1
const ZOOM_INC_DEC_LEVEL = 0.1
const getFinalSVGArrowPath = (parentId: string, id1 = '', id2 = '', isParallelNode = false): string => {
  if (!parentId) {
    return ''
  }
  const node1 = getComputedPosition(parentId, id1)
  const node2 = getComputedPosition(parentId, id2)
  if (!node1 || !node2) {
    return ''
  }

  const node1VerticalMid = node1.top + node1.height / 2
  const node2VerticalMid = node2.top + node2.height / 2

  const startPoint = `${node1.right},${node1VerticalMid}`
  const horizontalMid = Math.abs((node1.right + node2.left) / 2)
  const endPoint = `${node2.left},${node2VerticalMid}`

  if (node2.y < node1.y) {
    //  child node is at top
    const curveLeftToTop = `Q${horizontalMid},${node1VerticalMid} ${horizontalMid},${node1VerticalMid - 20}`
    const curveBottomToRight = `Q${horizontalMid},${node2VerticalMid} ${horizontalMid + 20},${node2VerticalMid}`
    return `M${startPoint} L${horizontalMid - 20},${node1VerticalMid} ${curveLeftToTop} 
    L${horizontalMid},${node2VerticalMid + 20} ${curveBottomToRight} L${endPoint}`
  } else if (node1.y === node2.y) {
    // both nodes are at same level vertically
    return `M${startPoint}  L${endPoint} `
  } else {
    //  child node is at bottom
    const curveLeftToBottom = `Q${horizontalMid},${node1VerticalMid} ${horizontalMid},${node1VerticalMid + 20}`

    const curveTopToRight = `Q${horizontalMid},${node2VerticalMid} ${horizontalMid + 20},${node2VerticalMid}`

    if (isParallelNode) {
      const updatedStart = node1.left - 45 // new start point
      const parallelLinkStart = `${
        updatedStart // half of link length
      },${node1VerticalMid}`

      const curveLBparallel = `Q${updatedStart + 20},${node1VerticalMid} ${updatedStart + 20},${node1VerticalMid + 20} `
      const curveTRparallel = `Q${updatedStart + 20},${node2VerticalMid} ${updatedStart + 40},${node2VerticalMid}`

      return `M${parallelLinkStart} 
      ${curveLBparallel} 
      L${updatedStart + 20},${node2VerticalMid - 20} 
      ${curveTRparallel} 
      L${node2.left},${node2VerticalMid} 
      M${node2.right},${node2VerticalMid} 
      L${node2.right + 10},${node2VerticalMid}
      Q${node2.right + 25},${node2VerticalMid} ${node2.right + 25},${node2VerticalMid - 20}      
      L${node2.right + 25},${node1VerticalMid + 20}
      Q${node2.right + 25},${node1VerticalMid} ${node2.right + 40},${node1VerticalMid}
      `
    }
    return `M${startPoint} L${horizontalMid - 20},${node1VerticalMid} ${curveLeftToBottom} 
    L${horizontalMid},${node2VerticalMid - 20} ${curveTopToRight} L${endPoint}`
  }
}

const getComputedPosition = (parentId: string, childId: string): DOMRect => {
  const parentPos = document.getElementById(parentId)?.getBoundingClientRect() as DOMRect
  const childPos = document.getElementById(childId)?.getBoundingClientRect() as DOMRect
  const updatedTop = childPos.top - parentPos.top
  const updatedLeft = childPos.left - parentPos.left
  const updatedRight = updatedLeft + childPos.width
  const updatedBottom = updatedTop + childPos.height
  const updatedPos: DOMRect = {
    ...childPos,
    left: updatedLeft,
    top: updatedTop,
    right: updatedRight,
    bottom: updatedBottom,
    width: childPos.width,
    height: childPos.height,
    x: childPos.x,
    y: childPos.y
  }
  return updatedPos
}

const setupDragEventListeners = (canvasRef: RefObject<HTMLDivElement>): (() => void) => {
  let offset = [0, 0]
  const divOverlay = (canvasRef.current as HTMLDivElement).parentElement as HTMLDivElement
  const canvas = canvasRef.current as HTMLDivElement
  let isDown = false

  const onMouseMove = (e: any): void => {
    e.preventDefault()
    if (isDown) {
      canvas.style.left = e.clientX + offset[0] + 'px'
      canvas.style.top = e.clientY + offset[1] + 'px'
    }
  }

  const onMouseDown = (e: any): void => {
    isDown = true
    offset = [canvas.offsetLeft - e.clientX, canvas.offsetTop - e.clientY]
  }
  const onMouseUp = (): void => {
    isDown = false
  }

  divOverlay.addEventListener('mousedown', onMouseDown, true)
  document.addEventListener('mouseup', onMouseUp, true)
  document.addEventListener('mousemove', onMouseMove, true)
  return () => {
    divOverlay.removeEventListener('mousedown', onMouseDown)
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('mousemove', onMouseMove)
  }
}

const getSVGLinksFromPipeline = (stages?: StageElementWrapperConfig[], resultArr: string[] = []): string[] => {
  let prevElement: StageElementWrapperConfig
  stages?.forEach(stage => {
    if (!prevElement) {
      prevElement = stage
      return
    }
    if (stage.parallel) {
      getParallelNodeLinks(stage.parallel, prevElement, resultArr)
    } else {
      resultArr.push(
        getFinalSVGArrowPath('tree-container', prevElement.stage?.identifier as string, stage.stage?.identifier, false)
      )
    }
    prevElement = stage
  })
  return resultArr
}
const getParallelNodeLinks = (
  stages: StageElementWrapperConfig[],
  prevStage: StageElementWrapperConfig,
  resultArr: string[] = []
): void => {
  const [firstStage, ...restStages] = stages
  resultArr.push(
    getFinalSVGArrowPath('tree-container', prevStage.stage?.identifier as string, firstStage.stage?.identifier, false)
  )
  restStages?.forEach(stage => {
    resultArr.push(
      getFinalSVGArrowPath('tree-container', firstStage.stage?.identifier as string, stage.stage?.identifier, true)
    )
  })
}

const getScaleToFitValue = (elm: HTMLElement, paddingFromBottom = 20): number => {
  return (
    1 /
    Math.max(
      elm.clientWidth / window.innerWidth,
      elm.clientHeight / (window.innerHeight - elm.offsetTop - paddingFromBottom)
    )
  )
}
export {
  getFinalSVGArrowPath,
  setupDragEventListeners,
  getSVGLinksFromPipeline,
  ZOOM_INC_DEC_LEVEL,
  INITIAL_ZOOM_LEVEL,
  getScaleToFitValue
}
