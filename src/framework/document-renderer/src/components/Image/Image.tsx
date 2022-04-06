import React from 'react'
import type { IContentfulImage } from '../../types/contentfulTypes'

const Image: React.FC<IContentfulImage> = props => {
  const { redirectUrl, image, width } = props

  return redirectUrl ? (
    <a href={redirectUrl} target="_blank" rel="noreferrer">
      <img src={`https:${image.fields.file.url}?w=${width}`} />
    </a>
  ) : (
    <img src={`https:${image.fields.file.url}?w=${width}`} />
  )
}

export default Image
