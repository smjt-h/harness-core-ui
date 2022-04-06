import React from 'react'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { FontVariation, Color } from '@harness/design-system'
import type { IContentfulAnnouncement } from '../../types/contentfulTypes'
import Container from '../Container'
import RenderComponent from '../index'

const Announcement: React.FC<IContentfulAnnouncement> = (props: IContentfulAnnouncement) => {
  const { title, description, body } = props

  return (
    <Container border={{ bottom: true, color: Color.GREY_200 }} padding={{ top: 'xlarge', bottom: 'xlarge' }}>
      <Container font={{ variation: FontVariation.H4 }} color={Color.PRIMARY_9} margin={{ bottom: 'medium' }}>
        {title}
      </Container>
      {description ? documentToReactComponents(description) : undefined}
      {body?.map(item => (
        <RenderComponent key={item.sys.id} data={item} />
      ))}
    </Container>
  )
}

export default Announcement
