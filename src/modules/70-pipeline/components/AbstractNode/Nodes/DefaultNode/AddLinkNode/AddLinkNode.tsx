import React from 'react'
import cx from 'classnames'
import { Color } from '@harness/design-system'
import { Icon } from '@harness/uicore'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import defaultCss from '../DefaultNode.module.scss'
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
  data: T
  className?: string
}
export default function AddLinkNode<T>(props: AddLinkNodeProps<T>): React.ReactElement | null {
  const [showAddLink, setShowAddLink] = React.useState(false)
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
            node: props
          }
        })
      }}
      onDragOver={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation()
        event.preventDefault()
        setShowAddLink(true)
      }}
      onDragLeave={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation()
        event.preventDefault()
        setShowAddLink(false)
      }}
      onDrop={event => {
        event.stopPropagation()
        setShowAddLink(false)
        props?.fireEvent({
          type: Event.DropLinkEvent,
          target: event.target,
          data: {
            entityType: DiagramType.Link,
            node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
            destination: props
          }
        })
      }}
      className={cx(props.className, {
        [defaultCss.show]: showAddLink
      })}
    >
      <Icon name="plus" color={Color.WHITE} />
    </div>
  )
}
