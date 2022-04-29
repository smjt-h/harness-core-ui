/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import type { MultiTypeInputType } from '@harness/uicore'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type {
  StepElementConfig,
  ExecutionElementConfig,
  CloudformationCreateStackStepInfo,
  CloudformationDeleteStackStepInfo,
  NGVariable,
  CloudformationTags
} from 'services/cd-ng'

export const StoreTypes = {
  Inline: 'Inline',
  Remote: 'Remote'
}

export interface CreateStackProps<T = CreateStackData> {
  initialValues: T
  onUpdate?: (data: T) => void
  onChange?: (data: T) => void
  allowableTypes: MultiTypeInputType[]
  stepViewType?: StepViewType
  configTypes?: SelectOption[]
  isNewStep?: boolean
  inputSetData?: {
    template?: T
    path?: string
  }
  readonly?: boolean
  path?: string
  stepType?: string
  allValues?: T
}

export interface Connector {
  label: string
  value: string
  scope: Scope
  live: boolean
  connector: {
    type: string
    identifier: string
    name: string
    spec: { val: string; url: string; connectionType?: string; type?: string }
  }
}

export interface Parameter {
  identifier: string
  store: {
    type: string
    spec: {
      gitFetchType?: string
      connectorRef?: string
      branch?: string
      paths?: string[]
      region?: string
      urls?: string[]
    }
  }
}

export interface CreateStackData extends StepElementConfig {
  type: string
  name: string
  identifier: string
  timeout: string
  spec: {
    provisionerIdentifier: string
    configuration: {
      tags?:
        | {
            spec?: {
              content?: string
            }
          }
        | CloudformationTags
      stackName: string
      connectorRef: string | Connector
      region: string
      parameterOverrides?: NGVariable[]
      skipOnStackStatuses?: SelectOption[] | string[] | string
      capabilities?: SelectOption[] | string[] | string
      parameters?: Parameter[]
      roleArn?: string
      templateFile: {
        type: string
        spec: {
          type?: string
          templateBody?: string
          templateUrl?: string
        }
      }
    }
  }
}

export type ProvisionersOptions = 'CLOUD_FORMATION'
export interface CloudFormationData {
  provisioner: ExecutionElementConfig
  originalProvisioner?: Partial<ExecutionElementConfig>
  provisionerEnabled: boolean
  provisionerSnippetLoading?: boolean
  selectedProvisioner?: ProvisionersOptions
}
export interface CloudFormationProps {
  initialValues: CloudFormationData
  template?: CloudFormationData
  path?: string
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: CloudFormationData) => void
  onChange?: (data: CloudFormationData) => void
  allowableTypes: MultiTypeInputType[]
}

export interface CreateStackStepInfo {
  spec: CloudformationCreateStackStepInfo
  name: string
  identifier: string
  timeout: string
  type: string
}

export interface CloudFormationCreateStackProps {
  allowableTypes: MultiTypeInputType[]
  isNewStep: boolean | undefined
  readonly: boolean | undefined
  initialValues: any
  onUpdate: (values: any) => void
  onChange: (values: any) => void
  stepViewType: StepViewType | undefined
}

export enum DeleteStackTypes {
  Inline = 'Inline',
  Inherited = 'Inherited'
}

export interface DeleteStackData extends StepElementConfig {
  type: string
  name: string
  identifier: string
  timeout: string
  spec: {
    configuration: {
      type: string
      spec: {
        connectorRef?: string | Connector
        region?: string
        roleArn?: string
        stackName?: string
        provisionerIdentifier?: string
      }
    }
  }
}

export interface CFDeleteStackStepInfo extends StepElementConfig {
  spec: CloudformationDeleteStackStepInfo
  name: string
  identifier: string
  timeout: string
  type: string
}

export interface CloudFormationDeleteStackProps {
  allowableTypes: MultiTypeInputType[]
  isNewStep: boolean | undefined
  readonly: boolean | undefined
  initialValues: any
  onUpdate: (values: any) => void
  onChange: (values: any) => void
  stepViewType: StepViewType | undefined
}

export interface DeleteStackProps<T = DeleteStackData> {
  initialValues: T
  onUpdate?: (data: T) => void
  onChange?: (data: T) => void
  allowableTypes: MultiTypeInputType[]
  stepViewType?: StepViewType
  configTypes?: SelectOption[]
  isNewStep?: boolean
  inputSetData?: {
    template?: T
    path?: string
  }
  readonly?: boolean
  path?: string
  stepType?: string
  allValues?: T
}