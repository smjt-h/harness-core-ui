import React, { useEffect, useState } from 'react'
import { createClient, ContentfulClientApi } from 'contentful'
import type { IContentfulCustomIdType, ContentType } from './types/contentfulTypes'

// const contentfulClient = createClient({
//   space: 'ghsvvkpjf443',
//   accessToken: 'R6XccOT3EI1ylS7epC1vzq6roBnt7yFYLChKuudUp3g'
// })

let contentfulClient: ContentfulClientApi | undefined = undefined

interface ContentfulContextProps {
  customIdMapping: Record<string, string>
}

export const ContentfulContext = React.createContext<ContentfulContextProps>({
  customIdMapping: {}
})

interface ContentfulContextProviderProps {
  accessToken: string
  space: string
}

export const ContentfulContextProvider: React.FC<ContentfulContextProviderProps> = props => {
  const { accessToken, space } = props
  const [customIdMapping, setCustomIdMapping] = useState<Record<string, string>>({})

  useEffect(() => {
    contentfulClient = createClient({
      space,
      accessToken
    })

    contentfulClient
      .getEntries<IContentfulCustomIdType>({
        content_type: 'customIdMapping'
      })
      .then(response => {
        const map: Record<string, string> = response.items.reduce((obj, item) => {
          return { ...obj, [item.fields.customId]: item.fields.document.sys.id }
        }, {})
        setCustomIdMapping(map)
      })
  }, [])

  return <ContentfulContext.Provider value={{ customIdMapping }}>{props.children}</ContentfulContext.Provider>
}

interface useContentfulOptions {
  content_id: string
  content_type: ContentType
}

interface useContentfulState<T> {
  data?: T
  loading: boolean
}

export function useContentful<T>(options: useContentfulOptions): useContentfulState<T> {
  const { content_id, content_type } = options
  const [data, setData] = useState<T | undefined>()
  const [loading, setLoading] = useState(false)
  const { customIdMapping } = React.useContext(ContentfulContext)

  useEffect(() => {
    const documentId = customIdMapping[content_id]
    if (documentId) {
      if (contentfulClient) {
        setLoading(true)
        contentfulClient
          .getEntries<T>({
            'sys.id': documentId,
            content_type: content_type,
            include: 10
          })
          .then(response => {
            setLoading(false)
            // add a null check
            setData(response.items[0].fields)
          })
      } else {
        throw new Error('Please use Contentful Provider')
      }
    }
  }, [content_id, content_type, customIdMapping])

  return {
    data,
    loading
  }
}
