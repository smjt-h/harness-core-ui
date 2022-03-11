import { Color, Icon, Text } from '@harness/uicore'
import React from 'react'

const LinkComponent: React.FC<any> = ({ data }) => {
  const { URL, label } = data || {}
  return (
    <Text color={Color.PRIMARY_9} margin={{ bottom: 'small' }}>
      <a target="_blank" href={URL} rel="noreferrer">
        {label}
      </a>
      <Icon margin={{ left: 'tiny' }} color={Color.PRIMARY_9} name="main-chevron-right" size={11} />
    </Text>
  )
}
export default LinkComponent
