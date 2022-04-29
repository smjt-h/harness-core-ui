/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, Container, Layout, MultiSelectDropDown, Select, Text, TextInput } from '@harness/uicore'
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
  const { changeType, value, duration, id, condition } = notificationRule
  return (
    <>
      <Layout.Horizontal padding={{ top: 'large' }} key={id} spacing="medium">
        <Layout.Vertical spacing="xsmall" padding={{ right: 'small' }}>
          <Text>{'Condition'}</Text>
          <Select
            name={`${id}.condition`}
            className={css.field}
            value={condition}
            items={conditionOptions}
            onChange={option => {
              handleChangeField(notificationRule, option, 'condition', 'changeType', changeType)
            }}
          />
        </Layout.Vertical>
        {changeType ? (
          <Layout.Vertical spacing="xsmall" padding={{ left: 'small', right: 'small' }}>
            <Text>{'Change Type'}</Text>
            <MultiSelectDropDown
              value={Array.isArray(changeType) ? changeType : []}
              items={changeTypeOptions}
              className={css.field}
              onChange={option => {
                handleChangeField(notificationRule, option, 'changeType', 'value', value)
              }}
            />
          </Layout.Vertical>
        ) : null}
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
