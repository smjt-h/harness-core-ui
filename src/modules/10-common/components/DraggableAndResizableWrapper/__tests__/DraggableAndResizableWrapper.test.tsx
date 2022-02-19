import React from 'react'
import { render } from '@testing-library/react'
import { DraggableAndResizableWrapperWithRef } from '../DraggableAndResizableWrapper'

const RND_OVERRIDE_PROPS = {
  default: {
    x: 50,
    y: 30,
    width: 480,
    height: 500
  }
}

describe('Draggable and Resizable test', () => {
  test('snapshot testing 1', () => {
    const ref = React.createRef() as React.ForwardedRef<null | HTMLDivElement>
    const { container } = render(
      <DraggableAndResizableWrapperWithRef rndOverrideProps={RND_OVERRIDE_PROPS} ref={ref}>
        <div>Draggable and resizable div</div>
      </DraggableAndResizableWrapperWithRef>
    )
    expect(container).toMatchSnapshot()
  })

  test('snapshot testing with additional props', () => {
    const ref = React.createRef() as React.ForwardedRef<null | HTMLDivElement>
    const { container } = render(
      <DraggableAndResizableWrapperWithRef
        className="draggableAndResizableWrapper"
        rndOverrideProps={{ ...RND_OVERRIDE_PROPS, minWidth: 250, minHeight: 250, bounds: '#parent-id' }}
        ref={ref}
      >
        <div>Draggable and resizable div</div>
      </DraggableAndResizableWrapperWithRef>
    )
    expect(container).toMatchSnapshot()
  })
})
