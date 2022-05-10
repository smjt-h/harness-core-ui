import React from 'react'
import { Color, Container, Icon, Text } from '@wings-software/uicore'
import type { IconName } from '@blueprintjs/core'

export const IconWithText = ({ icon, text = '' }: { icon: IconName; text?: string }) => {
  return (
    <>
      <Container flex>
        <Icon name={icon} size={10} />
        <Text font={{ size: 'xsmall' }} color={Color.GREY_800}>
          {text}
        </Text>
      </Container>
    </>
  )
}
