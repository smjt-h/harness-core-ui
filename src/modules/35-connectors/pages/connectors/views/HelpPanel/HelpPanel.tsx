import { Checkbox, Color, FontVariation, Icon, Layout, Text } from '@harness/uicore'
import React, { useEffect, useState } from 'react'
import Article from './Article/Article'
import css from './HelpPanel.module.scss'

const HelpPanel: React.FC<any> = ({ id, onClose }) => {
  const [showPanel, setShowPanel] = useState<boolean>(false)
  const [data, setData] = useState<any>(undefined)

  useEffect(() => {
    fetch(
      `http://localhost:1337/api/guides/${id}?populate[0]=articles&populate[1]=articles.components&populate[2]=articles.components.Thumbnail`
    )
      .then(res => res.json())
      .then(response => {
        setData(response)
        setShowPanel(true)
      })
  }, [])

  const { articles = [], title } = data?.data?.attributes || {}

  if (!showPanel) {
    return <></>
  }

  return (
    <Layout.Vertical padding="xlarge" className={css.container}>
      <Layout.Horizontal
        className={css.header}
        flex={{ justifyContent: 'space-between' }}
        padding={{ bottom: 'xlarge' }}
      >
        <Text color={Color.BLACK} font={{ variation: FontVariation.UPPERCASED }}>
          {title}
        </Text>
        <Icon className={css.cross} name="cross" onClick={onClose} />
      </Layout.Horizontal>
      <Layout.Vertical className={css.content}>
        {articles.data.map((article: any) => (
          <Article key={article.id} article={article} />
        ))}
      </Layout.Vertical>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Checkbox />
        <Text font={{ variation: FontVariation.SMALL }}>Don't show this again</Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default HelpPanel
