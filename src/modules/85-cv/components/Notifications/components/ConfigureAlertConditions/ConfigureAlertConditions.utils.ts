/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiSelectOption, SelectOption } from '@harness/uicore'
import { v4 as uuid } from 'uuid'
import type { SRMNotificationRules } from '../SRMNotificationTable/SRMNotificationTable.types'
import { defaultOption } from './ConfigureAlertConditions.constants'
import type { NotificationRule } from './ConfigureAlertConditions.types'

export const createNotificationRule = (): NotificationRule => {
  return {
    id: uuid(),
    condition: null
  }
}

export function getUpdatedNotificationRules({
  notificationRules,
  notificationRule,
  currentField,
  currentFieldValue,
  nextField,
  nextFieldValue
}: {
  notificationRules: NotificationRule[]
  notificationRule: NotificationRule
  currentField: string
  currentFieldValue: string | SelectOption | MultiSelectOption[]
  nextField?: string
  nextFieldValue?: string | SelectOption | MultiSelectOption[]
}): NotificationRule[] {
  return notificationRules.map(el => {
    if (el.id === notificationRule.id) {
      return {
        ...el,
        [currentField]: currentFieldValue,
        ...(nextField && { [nextField]: nextFieldValue ?? defaultOption })
      }
    } else return el
  })
}

export const getInitialNotificationRules = (prevStepData: SRMNotificationRules | undefined): NotificationRule[] => {
  return prevStepData?.notificationRules || [createNotificationRule()]
}
