import type { MultiSelectOption, SelectOption } from '@harness/uicore'
import { v4 as uuid } from 'uuid'
import { defaultOption } from './ConfigureAlertConditions.constants'
import type { NotificationRule } from './ConfigureAlertConditions.types'
import type { SRMNotificationRules } from '../SRMNotificationTable.types'

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
  nextField
}: {
  notificationRules: NotificationRule[]
  notificationRule: NotificationRule
  currentField: string
  currentFieldValue: number | SelectOption | MultiSelectOption[]
  nextField?: string
}): NotificationRule[] {
  return notificationRules.map(el => {
    if (el.id === notificationRule.id) {
      return {
        ...el,
        [currentField]: currentFieldValue,
        ...(nextField && { [nextField]: defaultOption })
      }
    } else return el
  })
}

export const getInitialNotificationRules = (prevStepData: SRMNotificationRules | undefined): NotificationRule[] => {
  return prevStepData?.notificationRules || [createNotificationRule()]
}
