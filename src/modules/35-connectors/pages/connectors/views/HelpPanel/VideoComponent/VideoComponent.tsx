import { Container } from '@harness/uicore'
import React from 'react'

const VideoComponent: React.FC<any> = ({ data }) => {
  const thumbNailUrl = data?.Thumbnail?.data?.attributes?.url
  const imageHeight = data?.Thumbnail?.data?.attributes?.height
  const imageWidth = data?.Thumbnail?.data?.attributes?.width

  return (
    <Container padding={{ top: 'large' }} style={{ width: '350px' }}>
      <a href={data.URL} target="_blank" rel="noreferrer">
        <img src={'http://localhost:1337' + thumbNailUrl} height="100%" width="100%" />
      </a>
    </Container>
  )
}
export default VideoComponent
