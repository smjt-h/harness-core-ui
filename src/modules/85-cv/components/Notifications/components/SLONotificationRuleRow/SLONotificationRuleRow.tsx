/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, Container, Layout, Select, Text, TextInput } from '@harness/uicore'
import React from 'react'
import type { NotificationRuleRowProps } from './SLONotificationRuleRow.types'
import { getValueFromEvent } from './SLONotificationRuleRow.utils'
import { sloConditionOptions } from './SLONotificationRuleRow.constants'
import css from './SLONotificationRuleRow.module.scss'

export default function SLONotificationRuleRow({
  notificationRule,
  showDeleteNotificationsIcon,
  handleDeleteNotificationRule,
  handleChangeField
}: NotificationRuleRowProps): JSX.Element {
  const { changeType, value, duration, id, condition } = notificationRule
  return (
    <>
      <Layout.Horizontal padding={{ top: 'large' }} key={id} spacing="medium">
        <Layout.Vertical spacing="xsmall" padding={{ right: 'small' }}>
          <Text>{'Condition'}</Text>
          <Select
            name={`${id}.condition`}
            className={css.sloConditionField}
            value={condition}
            items={sloConditionOptions}
            onChange={option => {
              handleChangeField(notificationRule, option, 'condition', 'value', changeType)
            }}
          />
        </Layout.Vertical>
        {value ? (
          <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
            <Text>{'Value is below'}</Text>
            <TextInput
              type="number"
              value={value as string}
              name={`${id}.value`}
              className={css.field}
              onChange={e => {
                handleChangeField(notificationRule, getValueFromEvent(e), 'value', 'duration', duration)
              }}
            />
          </Layout.Vertical>
        ) : null}
        {duration ? (
          <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
            <Text>{'Duration'}</Text>
            <TextInput
              type="number"
              value={duration as string}
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
