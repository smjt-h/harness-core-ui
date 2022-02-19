import React from 'react'
import { Rnd, RndResizeCallback, Props as ReactRndProps } from 'react-rnd'
import { Container } from '@wings-software/uicore'

interface DraggableAndResizableWrapperProps {
  className?: string
  onResize?: RndResizeCallback
  rndOverrideProps?: ReactRndProps
  children?: React.ReactNode
}

export const DraggableAndResizableWrapper = (
  props: DraggableAndResizableWrapperProps,
  draggableAndResizeableContainerRef: React.ForwardedRef<null | HTMLDivElement>
) => {
  const { className, onResize, rndOverrideProps } = props

  return (
    <Rnd
      bounds="window"
      enableResizing={{
        top: true,
        bottom: true,
        left: true,
        right: true,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
      }}
      {...rndOverrideProps}
      className={className}
      onResize={onResize}
    >
      <Container style={{ height: '100%' }} ref={draggableAndResizeableContainerRef}>
        {props.children}
      </Container>
    </Rnd>
  )
}

export const DraggableAndResizableWrapperWithRef = React.forwardRef(DraggableAndResizableWrapper)
