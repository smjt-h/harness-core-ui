import type { StyledProps } from '@harness/design-system'
import { styledClasses } from '@harness/design-system'
import React, { HTMLAttributes } from 'react'

export interface ContainerProps extends HTMLAttributes<HTMLDivElement>, StyledProps {}

const Container: React.FC<ContainerProps> = props => {
  const { children } = props

  return (
    <div className={styledClasses(props)} {...props}>
      {children}
    </div>
  )
}

export default Container
