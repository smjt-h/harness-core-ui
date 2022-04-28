/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StepProps, SelectOption, MultiSelectOption } from '@harness/uicore'
import type { SRMNotificationRules } from '../SRMNotificationTable/SRMNotificationTable.types'

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
