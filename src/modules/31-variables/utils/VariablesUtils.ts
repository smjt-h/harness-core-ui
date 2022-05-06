/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { pick } from 'lodash-es'
import type { SelectOption } from '@wings-software/uicore'
import type { StringKeys } from 'framework/strings'
import type { StringVariableConfigDTO, VariableConfigDTO, VariableDTO, VariableRequestDTO } from 'services/cd-ng'

export enum VariableType {
  String = 'String'
}

export enum Validation {
  FIXED = 'FIXED',
  FIXED_SET = 'FIXED_SET',
  REGEX = 'REGEX'
}

export interface VariableFormData {
  name: string
  identifier: string
  description?: string
  type: VariableDTO['type']
  fixedValue?: string
  allowedValues?: string[]
  defaultValue?: string
  valueType: VariableConfigDTO['valueType']
}

export interface VariableFormDataWithScope extends VariableFormData {
  projectIdentifier?: string
  orgIdentifier?: string
}

export const labelStringMap: Record<VariableType, StringKeys> = {
  [VariableType.String]: 'string'
}

export const getVaribaleTypeOptions = (getString: (key: StringKeys) => string): SelectOption[] => {
  return [
    {
      label: getString('string'),
      value: VariableType.String
    }
  ]
}

export function convertVariableFormDataToDTO(data: VariableFormDataWithScope): VariableRequestDTO {
  return {
    variable: {
      ...pick(data, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier', 'description', 'type']),
      spec: getVariableSpecFromFormData(data)
    }
  }
}
function getVariableSpecFromFormData(data: VariableFormDataWithScope): StringVariableConfigDTO {
  const variableType = data.type
  switch (variableType) {
    case VariableType.String:
      return {
        ...pick(data, ['valueType', 'fixedValue', 'allowedValues', 'defaultValue'])
      }
    default:
      throw Error(` ${variableType} variable type is not supported.`)
  }
}
