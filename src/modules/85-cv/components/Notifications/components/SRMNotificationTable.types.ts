import type { NotificationChannelWrapper } from 'services/cd-ng'
import type { NotificationRule } from './ConfigureAlertConditions/ConfigureAlertConditions.types'

export interface SRMNotificationRules {
  enabled?: boolean
  name?: string
  notificationMethod?: NotificationChannelWrapper
  notificationRules?: NotificationRule[]
}

export interface NotificationRulesItem {
  index: number
  notificationRules: SRMNotificationRules
}
