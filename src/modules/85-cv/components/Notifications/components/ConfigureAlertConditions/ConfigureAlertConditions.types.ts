import type { StepProps, SelectOption, MultiSelectOption } from '@harness/uicore'
import type { SRMNotificationRules } from '../SRMNotificationTable.types'

export type ConfigureAlertConditionsProps = StepProps<SRMNotificationRules>

export type NotificationConditions = StepProps<SRMNotificationRules> & {
  notificationRules: NotificationRule[]
}

export interface NotificationRule {
  id: string
  condition: SelectOption | null
  changeType?: MultiSelectOption[]
  value?: number | SelectOption
  duration?: number | SelectOption
}
