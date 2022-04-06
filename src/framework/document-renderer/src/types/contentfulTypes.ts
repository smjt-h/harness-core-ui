import type { Entry, Asset } from 'contentful'
import type { Color } from '@harness/design-system'
import type { Document as RichTextDocument } from '@contentful/rich-text-types'

export interface ComponentValue {
  name: string
}

export enum ContentType {
  group = 'document',
  announcement = 'announcement',
  image = 'image',
  video = 'video',
  youtubeVideo = 'youtubeVideo'
}

export interface IContentfulDocument {
  items: Entry<ComponentValue>[]
  backgroundColor: Color
  title: string
}

export interface IContentfulAnnouncement extends ComponentValue {
  title: string
  description?: RichTextDocument
  body?: Entry<ComponentValue>[]
}

export interface IContentfulImage extends ComponentValue {
  image: Asset
  redirectUrl: string
  width: number
}

export interface IContentfulYoutubeVideo extends ComponentValue {
  id: string
  thumbnailHeight: number
  thumbnailWidth: number
}

export interface IContentfulVideo extends ComponentValue {
  thumbnailUrl: string
  thumbailHeight: number
  thumbnailWidth: number
}

export interface IContentfulCustomIdType {
  customId: string
  document: Entry<IContentfulDocument>
}
