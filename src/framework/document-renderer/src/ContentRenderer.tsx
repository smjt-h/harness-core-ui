import React from 'react'
import { Color, FontVariation } from '@harness/design-system'
import RenderComponent from './components'
import { useContentful } from './ContentfulContext'
import { ContentType, IContentfulDocument } from './types/contentfulTypes'
import Container from './components/Container'

interface ContentRendererProps {
  contentId: string
  type?: ContentRendererType
  options?: any
}

export enum ContentRendererType {
  FIXED_CONTAINER = 'FIXED_CONTAINER'
}

const getContainerStyle = (isFixedContainer: boolean) => {
  if (isFixedContainer) {
    return {
      minHeight: '500px',
      width: '400px',
      position: 'fixed',
      bottom: '5%',
      right: '5%',
      zIndex: 1000,
      boxShadow: '0px 0px 2px rgba(40, 41, 61, 0.04), 0px 4px 8px rgba(96, 97, 112, 0.16)'
    }
  }
  return { height: '100%', width: '100%' }
}

const ContentRenderer: React.FC<ContentRendererProps> = (props: ContentRendererProps) => {
  const { contentId, type } = props
  const { data, loading } = useContentful<IContentfulDocument>({
    content_id: contentId,
    content_type: ContentType.group
  })

  const { items = [], backgroundColor, title } = data || {}

  if (loading) {
    return <div>Loading content ...</div>
  }

  const renderHeader = () => {
    return (
      <Container
        flex={{ justifyContent: 'space-between', alignItems: 'center' }}
        padding={{ top: 'xlarge', bottom: 'xlarge' }}
        border={{ bottom: true, color: Color.GREY_200 }}
        color={Color.BLACK}
        font={{ variation: FontVariation.UPPERCASED }}
      >
        {title}
        <span>X</span>
      </Container>
    )
  }

  const renderContent = () => {
    return items?.map(item => <RenderComponent key={item.sys.id} data={item} />)
  }

  const renderFooter = () => {
    return (
      <Container
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
        padding={{ top: 'xlarge', bottom: 'xlarge' }}
        color={Color.BLACK}
        font={{ variation: FontVariation.BODY }}
      >
        <input type="checkbox" name="dontshowagain" id="dontshowagain" />
        <label htmlFor="dontshowagain">&nbsp;&nbsp;Don't show this again</label>
      </Container>
    )
  }

  const isFixedContainer = type === ContentRendererType.FIXED_CONTAINER

  return (
    <Container
      background={backgroundColor}
      style={getContainerStyle(isFixedContainer)}
      padding={{ left: 'xlarge', right: 'xlarge' }}
    >
      {isFixedContainer && renderHeader()}
      {renderContent()}
      {isFixedContainer && renderFooter()}
    </Container>
  )
}

export default ContentRenderer
