import React from 'react'
import { Color } from '@harness/design-system'
import { Icon } from '@harness/uicore'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
interface AddLinkNodeProps<T> {
  nextNode: any
  parentIdentifier?: string
  isParallelNode?: boolean
  readonly: boolean
  identifier: string
  fireEvent(arg0: {
    type: any
    target: EventTarget
    data: {
      prevNodeIdentifier?: any
      parentIdentifier?: any
      entityType: any
      identifier?: any
      node: any
      destination?: any
    }
  }): void
  prevNodeIdentifier: any
  showAddLink?: boolean
  data: T
  className?: string
}
export default function AddLinkNode<T>(props: AddLinkNodeProps<T>): React.ReactElement | null {
  return (
    <div
      data-linkid={props?.identifier}
      onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation()
        props?.fireEvent({
          type: Event.AddLinkClicked,
          target: event.target,
          data: {
            prevNodeIdentifier: props?.prevNodeIdentifier,
            parentIdentifier: props?.parentIdentifier,
            entityType: DiagramType.Link,
            identifier: props?.identifier,
            node: { ...props, ...props?.data }
          }
        })
      }}
      onDragOver={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation()
        event.preventDefault()
      }}
      onDrop={event => {
        event.stopPropagation()
        props?.fireEvent({
          type: Event.DropLinkEvent,
          target: event.target,
          data: {
            entityType: DiagramType.Link,
            node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
            destination: { ...props, ...props?.data }
          }
        })
      }}
      className={props.className}
    >
      <Icon name="plus" color={Color.WHITE} />
    </div>
  )
}
