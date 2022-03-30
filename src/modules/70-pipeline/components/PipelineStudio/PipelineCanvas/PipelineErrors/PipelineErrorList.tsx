import React from 'react'
import { Popover, Button, ButtonSize, ButtonVariation, Card, Icon, IconName, Layout, Text } from '@harness/uicore'

import { Classes, Position, PopoverInteractionKind } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './PipelineErrors.module.scss'
interface PipelineErrorCardProps {
  icon: IconName
  title: string
  errorText: string | string[]
  onClick: () => void
  buttonText: string
}

export default function PipelineErrorCardBasic(props: PipelineErrorCardProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal margin={{ bottom: 'xlarge' }}>
      <Card className={css.cardWithIcon}>
        <Icon name={props.icon} size={30} />
      </Card>
      <Layout.Vertical padding={{ left: 'medium' }}>
        <Text color={Color.BLACK} margin={{ bottom: 'small' }} font={{ size: 'normal', weight: 'bold' }}>
          {props.title}
        </Text>
        {Array.isArray(props.errorText) ? (
          <>
            <ErrorMessage errorText={props.errorText[0]} />
            <ErrorMessageList errors={props.errorText} />
          </>
        ) : (
          <ErrorMessage errorText={props.errorText} />
        )}
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

function ErrorMessage({ errorText, dark }: { errorText: string; dark?: boolean }): React.ReactElement {
  return (
    <Text
      color={dark ? Color.WHITE : Color.GREY_600}
      font={{ size: 'small', weight: 'semi-bold' }}
      lineClamp={1}
      margin={{ bottom: 'small' }}
      width={300}
    >
      {errorText}
    </Text>
  )
}

function ErrorMessageList({ errors }: { errors: string[] }): React.ReactElement {
  const { getString } = useStrings()
  return (
    <Popover
      content={
        <ul className={css.list}>
          {errors.map((error: string, index: number) => (
            <li key={index}>
              <ErrorMessage dark errorText={error} />
            </li>
          ))}
        </ul>
      }
      interactionKind={PopoverInteractionKind.HOVER}
      popoverClassName={Classes.DARK}
      position={Position.TOP}
    >
      <Text
        color={Color.GREY_600}
        font={{ size: 'small', weight: 'semi-bold' }}
        lineClamp={1}
        margin={{ bottom: 'small' }}
        width={100}
      >
        {getString('more', { number: errors.length - 1 })}
      </Text>
    </Popover>
  )
}
