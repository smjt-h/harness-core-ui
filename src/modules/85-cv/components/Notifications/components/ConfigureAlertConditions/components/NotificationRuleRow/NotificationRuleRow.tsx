import { Button, Container, FormInput, Layout, Text, TextInput } from '@harness/uicore'
import React from 'react'
import { conditionOptions, changeTypeOptions } from '../../ConfigureAlertConditions.constants'

import type { NotificationRuleRowProps } from './NotificationRuleRow.types'
import { getValueFromEvent } from './NotificationRuleRow.utils'
import css from './NotificationRuleRow.module.scss'

export default function NotificationRuleRow({
  notificationRule,
  showDeleteNotificationsIcon,
  handleDeleteNotificationRule,
  handleChangeField
}: NotificationRuleRowProps): JSX.Element {
  const { changeType, value, duration, id } = notificationRule
  return (
    <>
      <Layout.Horizontal padding={{ top: 'large' }} key={id} spacing="medium">
        <FormInput.Select
          name={`${id}.condition`}
          className={css.field}
          label={'Condition'}
          items={conditionOptions}
          onChange={option => {
            handleChangeField(notificationRule, option, 'condition', 'changeType')
          }}
        />
        {changeType ? (
          <FormInput.MultiSelect
            name={`${id}.changeType`}
            className={css.field}
            label={'Change Type'}
            items={changeTypeOptions}
            onChange={option => {
              handleChangeField(notificationRule, option, 'changeType', 'value')
            }}
          />
        ) : null}
        {value ? (
          <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
            <Text>{'Value is below'}</Text>
            <TextInput
              type="number"
              name={`${id}.value`}
              className={css.field}
              onChange={e => {
                handleChangeField(notificationRule, getValueFromEvent(e), 'value', 'duration')
              }}
            />
          </Layout.Vertical>
        ) : null}
        {duration ? (
          <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
            <Text>{'Duration'}</Text>
            <TextInput
              type="number"
              name={`${id}.duration`}
              className={css.field}
              onChange={e => {
                handleChangeField(notificationRule, getValueFromEvent(e), 'duration')
              }}
            />
          </Layout.Vertical>
        ) : null}
        {showDeleteNotificationsIcon ? (
          <Container padding={{ top: 'large' }}>
            <Button
              icon="main-trash"
              iconProps={{ size: 20 }}
              minimal
              onClick={() => handleDeleteNotificationRule(notificationRule.id)}
            />
          </Container>
        ) : null}
      </Layout.Horizontal>
      <hr className={css.separator} />
    </>
  )
}
