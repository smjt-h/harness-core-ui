import React from 'react'
import type { IContentfulGroup } from '../types/contentfulTypes'
import Container from './Container'
import RenderComponent from '.'

const containerStyle = { height: '100%', width: '100%' }

const GroupedContent: React.FC<IContentfulGroup> = props => {
  const { items = [], backgroundColor } = props
  return (
    <Container background={backgroundColor} style={containerStyle} padding={{ left: 'xlarge', right: 'xlarge' }}>
      {items?.map(item => (
        <RenderComponent key={item.sys.id} data={item} />
      ))}
    </Container>
  )
}

export default GroupedContent
