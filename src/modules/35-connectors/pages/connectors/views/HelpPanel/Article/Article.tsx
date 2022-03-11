import { Color, FontVariation, Layout, Text } from '@harness/uicore'
import React from 'react'
import LinkComponent from '../LinkComponent/LinkComponent'
import VideoComponent from '../VideoComponent/VideoComponent'

import css from './Article.module.scss'

const getComponent = (component: any) => {
  switch (component.__component) {
    case 'component.video':
      return <VideoComponent data={component} />
    case 'component.link':
      return <LinkComponent data={component} />
    default:
      return <div>Component</div>
  }
}

const Article: React.FC<any> = ({ article }) => {
  const { Title, Description, components = [] } = article.attributes || {}
  return (
    <Layout.Vertical className={css.container} padding={{ top: 'xlarge', bottom: 'xlarge' }}>
      <Text margin={{ bottom: 'large' }} font={{ variation: FontVariation.H4 }} color={Color.PRIMARY_9}>
        {Title}
      </Text>
      {Description ? <Text>{Description}</Text> : undefined}
      {components.map((component: any) => getComponent(component))}
    </Layout.Vertical>
  )
}

export default Article
