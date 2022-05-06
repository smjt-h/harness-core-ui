/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StepProps, SelectOption, MultiSelectOption } from '@harness/uicore'
import type { NotificationChannelWrapper } from 'services/cd-ng'

export type ConfigureMonitoredServiceAlertConditionsProps = StepProps<SRMNotificationRules>
export type ConfigureSLOAlertConditionsProps = StepProps<SRMNotificationRules>

export type NotificationConditions = StepProps<SRMNotificationRules> & {
  notificationRules: NotificationRule[]
}

export interface NotificationRule {
  id: string
  condition: SelectOption | null
  changeType?: MultiSelectOption[]
  value?: string | SelectOption
  duration?: string | SelectOption
}

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
