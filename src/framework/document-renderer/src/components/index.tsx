import React from 'react'
import type { Entry } from 'contentful'
import { ComponentValue, ContentType } from '../types/contentfulTypes'
import Announcement from './Announcement/Announcement'
import Image from './Image/Image'
import Video from './Video/Video'
import YoutubeVideo from './YoutubeVideo/YoutubeVideo'

interface RenderComponentProps {
  data: Entry<ComponentValue>
}

type RenderComponentType = Exclude<ContentType, 'document'>

const componentMap: Record<RenderComponentType, any> = {
  [ContentType.announcement]: Announcement,
  [ContentType.image]: Image,
  [ContentType.video]: Video,
  [ContentType.youtubeVideo]: YoutubeVideo
}

const RenderComponent: React.FC<RenderComponentProps> = props => {
  const { data } = props
  const ComponentToRender = componentMap[data.sys.contentType.sys.id as RenderComponentType]

  return ComponentToRender ? <ComponentToRender {...data.fields} /> : <div>Component not found</div>
}

export default RenderComponent
