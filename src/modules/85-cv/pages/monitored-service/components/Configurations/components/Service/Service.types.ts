/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { NGTemplateInfoConfigWithMonitoredService } from '@templates-library/components/Templates/MonitoredServiceTemplate/MonitoredServiceTemplate'
import type { MonitoredServiceDTO } from 'services/cv'

export interface ServiceTabInterface {
  value: MonitoredServiceForm
  onSuccess: (val: any) => Promise<void>
  cachedInitialValues?: MonitoredServiceForm | null
  setDBData?: (val: MonitoredServiceForm) => void
  onDiscard?: () => void
  serviceTabformRef?: any
  onChangeMonitoredServiceType: (updatedValues: MonitoredServiceForm) => void
  isTemplate?: boolean
  updateTemplate?: (template: NGTemplateInfoConfigWithMonitoredService) => Promise<void>
  formikRef?: any
}
export interface MonitoredServiceRef {
  name: string
  tags?: { [key: string]: any }
  identifier: string
  description?: string
}

export interface MonitoredServiceForm extends Omit<MonitoredServiceDTO, 'projectIdentifier' | 'orgIdentifier'> {
  isEdit: boolean
}
