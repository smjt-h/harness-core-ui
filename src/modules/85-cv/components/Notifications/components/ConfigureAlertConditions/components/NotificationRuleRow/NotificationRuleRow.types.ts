import type { MultiSelectOption, SelectOption } from '@harness/uicore'
import type { NotificationRule } from '../../ConfigureAlertConditions.types'

export interface NotificationRuleRowProps {
  notificationRule: NotificationRule
  showDeleteNotificationsIcon: boolean
  handleChangeField: (
    notificationRule: NotificationRule,
    currentFieldValue: SelectOption | MultiSelectOption[] | number,
    currentField: string,
    nextField?: string
  ) => void
  handleDeleteNotificationRule: (id: string) => void
}
