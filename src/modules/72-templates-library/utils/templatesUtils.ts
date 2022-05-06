/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty, isEqual, startsWith } from 'lodash-es'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import get from 'lodash-es/get'
import type { UseStringsReturn } from 'framework/strings'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { NGTemplateInfoConfig, TemplateSummaryResponse } from 'services/template-ng'

export enum TemplateType {
  Step = 'Step',
  Stage = 'Stage',
  Pipeline = 'Pipeline',
  Service = 'Service',
  Infrastructure = 'Infrastructure',
  StepGroup = 'StepGroup',
  Execution = 'Execution',
  MonitoredService = 'MonitoredService'
}

export const AllTemplatesTypes = 'All'

export interface TemplateTypeOption {
  label: string
  value: string
  disabled?: boolean
}

export const getScopeBasedQueryParams = (
  { accountId, projectIdentifier, orgIdentifier }: ProjectPathProps,
  scope: Scope
) => {
  return {
    accountIdentifier: accountId,
    projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
    orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined
  }
}

export const getAllowedTemplateTypes = (
  getString: UseStringsReturn['getString'],
  module?: string,
  isPipelineTemplateEnabled?: boolean
): TemplateTypeOption[] => {
  const AllowedTemplateTypes = [
    {
      label: getString('step'),
      value: TemplateType.Step,
      disabled: false
    },
    {
      label: getString('common.stage'),
      value: TemplateType.Stage,
      disabled: false
    },
    {
      label: getString('common.pipeline'),
      value: TemplateType.Pipeline,
      disabled: !isPipelineTemplateEnabled
    },
    {
      label: getString('service'),
      value: TemplateType.Service,
      disabled: true
    },
    {
      label: getString('infrastructureText'),
      value: TemplateType.Infrastructure,
      disabled: true
    },
    {
      label: getString('stepGroup'),
      value: TemplateType.StepGroup,
      disabled: true
    },
    {
      label: getString('executionText'),
      value: TemplateType.Execution,
      disabled: true
    }
  ]
  if (module === 'cv') {
    AllowedTemplateTypes.push({
      label: getString('connectors.cdng.monitoredService.label'),
      value: TemplateType.MonitoredService,
      disabled: false
    })
    return AllowedTemplateTypes.sort((a, b) => Number(a.disabled) - Number(b.disabled))
  }
  return AllowedTemplateTypes
}

export const getVersionLabelText = (template: TemplateSummaryResponse, getString: UseStringsReturn['getString']) => {
  return isEmpty(template.versionLabel)
    ? getString('templatesLibrary.alwaysUseStableVersion')
    : template.stableTemplate
    ? getString('templatesLibrary.stableVersion', { entity: template.versionLabel })
    : template.versionLabel
}

export const getTemplateInputsCount = (temp: NGTemplateInfoConfig): number =>
  (JSON.stringify(temp)?.match(/<\+input>/g) || []).length

export const hasSameRunTimeInputs = (a: any, b: any): boolean => {
  if (isEqual(a, b)) {
    return true
  } else if (startsWith(a, RUNTIME_INPUT_VALUE) || startsWith(b, RUNTIME_INPUT_VALUE)) {
    return false
  } else if (typeof a !== 'object' || typeof b !== 'object') {
    return getTemplateInputsCount(a) === 0 && getTemplateInputsCount(b) === 0
  } else {
    if (Array.isArray(a) && Array.isArray(b)) {
      return a
        .filter(item => {
          for (const val in Object.values(item)) {
            if (startsWith(val, RUNTIME_INPUT_VALUE)) {
              return true
            }
          }
          return false
        })
        .every(item1 => {
          for (const item2 in b) {
            if (Object.entries(item1).every(([key, value]) => get(item2, key) === value)) {
              return true
            }
          }
          return false
        })
    } else if (!Array.isArray(a) && !Array.isArray(b)) {
      return Object.keys(a).every(k => hasSameRunTimeInputs(a[k], b[k]))
    } else {
      return getTemplateInputsCount(a) === 0 && getTemplateInputsCount(b) === 0
    }
  }
}
