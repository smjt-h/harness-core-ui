import React from 'react'
import { FontVariation, Text, TextProps } from '@harness/uicore'
interface ToolTipTitleProps {
  title: string
  toolTipId?: string
  textProps?: TextProps
}
export const TitleWithToolTipId: React.FC<ToolTipTitleProps> = ({ title, toolTipId, textProps = {} }) => {
  return (
    <Text font={{ variation: FontVariation.H4 }} tooltipProps={{ dataTooltipId: toolTipId }} {...textProps}>
      {title}
    </Text>
  )
}
