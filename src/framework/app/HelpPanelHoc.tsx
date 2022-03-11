import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import HelpPanel from '@connectors/pages/connectors/views/HelpPanel/HelpPanel'

let response: any = undefined
const HelpPanelHoc: React.FC = (props: any) => {
  const [guideId, setGuideId] = useState<number | undefined>(undefined)
  const history = useHistory()

  history.listen(location => {
    const guideToShow = response?.data?.find((guide: any) => {
      if (location.pathname.indexOf(guide.attributes.URL) > -1) {
        return true
      }
    })
    setGuideId(guideToShow?.attributes?.guide?.data?.id)
  })

  useEffect(() => {
    fetch('http://localhost:1337/api/triggers?populate=*')
      .then(res => res.json())
      .then(res => {
        response = res
        const guideToShow = res.data.find((guide: any) => {
          if (location.href.indexOf(guide.attributes.URL) > -1) {
            return true
          }
        })
        setGuideId(guideToShow?.attributes?.guide?.data?.id)
      })
  }, [])

  return (
    <>
      {props.children}
      {guideId ? <HelpPanel onClose={() => setGuideId(undefined)} id={guideId} /> : undefined}
    </>
  )
}

export default HelpPanelHoc
