import React from 'react'
import { Container, Text, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './EnvToolTipDisplay.module.scss'

export interface ToolTipProps {
  type?: string
  environmentRef?: string
  envRefList?: string[]
  color: Color
  font: any
  shouldAddEnvPrefix?: boolean
}
export const EnvironmentToolTipDisplay = ({
  type,
  environmentRef,
  envRefList,
  color,
  font,
  shouldAddEnvPrefix
}: ToolTipProps): JSX.Element => {
  const { getString } = useStrings()
  return (
    <>
      {type === 'Infrastructure' ? (
        <Text
          color={color}
          font={font}
          tooltip={
            <Container className={css.popOverClass} padding="small" border={{ radius: 5 }} background="black">
              {envRefList?.map(i => (
                <p key={i}>{i}</p>
              ))}
            </Container>
          }
        >
          {`${shouldAddEnvPrefix ? getString('environment') + ': ' : ''}${envRefList?.slice(0, 1).join(',')}`}
          {envRefList && envRefList?.length > 1 ? <span className={css.envToolTip}>+{envRefList.length - 1}</span> : ''}
        </Text>
      ) : (
        <Text color={color} font={font}>
          {`${shouldAddEnvPrefix ? getString('environment') + ': ' : ''}${environmentRef}`}
        </Text>
      )}
    </>
  )
}
