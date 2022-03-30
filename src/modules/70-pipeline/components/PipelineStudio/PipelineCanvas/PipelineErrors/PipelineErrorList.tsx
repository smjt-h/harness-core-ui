import React from 'react'
import { Button, ButtonSize, ButtonVariation, Card, Icon, IconName, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import css from './PipelineErrors.module.scss'
interface PipelineErrorCardProps {
  icon: IconName
  title: string
  errorText: string
  onClick: () => void
  buttonText: string
}

export default function PipelineErrorCardBasic(props: PipelineErrorCardProps): React.ReactElement {
  return (
    <Layout.Horizontal margin={{ bottom: 'xlarge' }}>
      <Card className={css.cardWithIcon}>
        <Icon name={props.icon} size={30} />
      </Card>
      <Layout.Vertical padding={{ left: 'medium' }}>
        <Text color={Color.BLACK} margin={{ bottom: 'small' }} font={{ size: 'normal', weight: 'bold' }}>
          {props.title}
        </Text>
        <Text
          color={Color.GREY_600}
          font={{ size: 'small', weight: 'semi-bold' }}
          lineClamp={1}
          margin={{ bottom: 'small' }}
          width={300}
        >
          {props.errorText}
        </Text>
        <Button
          className={css.fixButton}
          onClick={props.onClick}
          size={ButtonSize.SMALL}
          variation={ButtonVariation.PRIMARY}
          text={props.buttonText}
        />
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
