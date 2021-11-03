import React from 'react'
import { Color, Container, Icon, Text } from '@wings-software/uicore'

export const handleZeroOrInfinityTrend = (trend: string | undefined, intentColor: Color): JSX.Element => {
  const trendChange = trend ? parseInt(trend) : 0
  return isNaN(trendChange) ? ( // handling Infinity and other unexpected trends
    <Container flex={{ alignItems: 'center' }}>
      <Icon name={'caret-up'} color={intentColor}></Icon>
      <Icon name={'infinityTrend'} size={20} color={intentColor}></Icon>
    </Container>
  ) : (
    // handing 0 trend change
    <Container flex>{renderTrend(trend, Color.GREY_300)}</Container>
  )
}

export const renderTrend = (trend: string | undefined, intentColor: Color): JSX.Element => {
  const trendChange = trend ? parseInt(trend) : 0
  return (
    <>
      <Icon
        name={trendChange === 0 ? 'caret-right' : trendChange < 0 ? 'caret-down' : 'caret-up'}
        color={intentColor}
      ></Icon>
      <Text font="xsmall" color={intentColor}>
        {trend}
      </Text>
    </>
  )
}
