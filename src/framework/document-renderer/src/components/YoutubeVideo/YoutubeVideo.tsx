import React from 'react'
import type { IContentfulYoutubeVideo } from '../../types/contentfulTypes'
import Container from '../Container'

const getYoutubeRedirectionURl = (id: string): string => `https://www.youtube.com/watch?v=${id}`

const getYoutubeThumbailURL = (id: string): string => `https://img.youtube.com/vi/${id}/hqdefault.jpg`

const YoutubeVideo: React.FC<IContentfulYoutubeVideo> = props => {
  const { id, thumbnailWidth, thumbnailHeight } = props
  return (
    <Container margin={{ top: 'medium' }}>
      <a href={getYoutubeRedirectionURl(id)} target="_blank" rel="noreferrer">
        <img src={getYoutubeThumbailURL(id)} height={thumbnailHeight} width={thumbnailWidth} />
      </a>
    </Container>
  )
}

export default YoutubeVideo
