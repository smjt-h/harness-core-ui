/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import isEmpty from 'lodash/isEmpty'
import { get } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import { getNameAndIdentifierSchema } from '@pipeline/utils/tempates'
import {
  getFailureStrategiesValidationSchema,
  getVariablesValidationField
} from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/validation'
import { isServerlessDeploymentType, ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { GetExecutionStrategyYamlQueryParams } from 'services/cd-ng'

const namespaceRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/
const releaseNameRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/

export enum InfraDeploymentType {
  KubernetesDirect = 'KubernetesDirect',
  KubernetesGcp = 'KubernetesGcp',
  ServerlessAwsLambda = 'ServerlessAwsLambda',
  ServerlessGoogleFunctions = 'ServerlessGoogleFunctions',
  ServerlessAzureFunctions = 'ServerlessAzureFunctions',
  AmazonSAM = 'AwsSAM',
  AzureFunctions = 'AzureFunctions'
}

export const deploymentTypeToInfraTypeMap = {
  [ServiceDeploymentType.ServerlessAwsLambda]: InfraDeploymentType.ServerlessAwsLambda,
  [ServiceDeploymentType.ServerlessAzureFunctions]: InfraDeploymentType.ServerlessAzureFunctions,
  [ServiceDeploymentType.ServerlessGoogleFunctions]: InfraDeploymentType.ServerlessGoogleFunctions
}

export function getNameSpaceSchema(
  getString: UseStringsReturn['getString'],
  isRequired = true
): Yup.StringSchema<string | undefined> {
  const namespaceSchema = Yup.string().test('namespace', getString('cd.namespaceValidation'), function (value) {
    if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED || isEmpty(value)) {
      return true
    }
    return namespaceRegex.test(value)
  })
  if (isRequired) {
    return namespaceSchema.required(getString('fieldRequired', { field: getString('common.namespace') }))
  }
  return namespaceSchema
}
export function getReleaseNameSchema(
  getString: UseStringsReturn['getString'],
  isRequired = true
): Yup.StringSchema<string | undefined> {
  const releaseNameSchema = Yup.string().test('releaseName', getString('cd.releaseNameValidation'), function (value) {
    if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED || isEmpty(value)) {
      return true
    }
    return releaseNameRegex.test(value)
  })
  if (isRequired) {
    return releaseNameSchema.required(getString('fieldRequired', { field: getString('common.releaseName') }))
  }
  return releaseNameSchema
}

export function getValidationSchemaWithRegion(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    region: Yup.lazy((): Yup.Schema<unknown> => {
      return Yup.string().required(getString('validation.regionRequired'))
    }),
    stage: Yup.lazy((): Yup.Schema<unknown> => {
      return Yup.string().required(getString('cd.pipelineSteps.infraTab.stageIsRequired'))
    })
  })
}

export function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    stage: Yup.lazy((): Yup.Schema<unknown> => {
      return Yup.string().required(getString('cd.pipelineSteps.infraTab.stageIsRequired'))
    })
  })
}

export function getConnectorSchema(getString: UseStringsReturn['getString']): Yup.StringSchema<string | undefined> {
  return Yup.string().required(getString('fieldRequired', { field: getString('connector') }))
}

export function getServiceRefSchema(getString: UseStringsReturn['getString']): Yup.StringSchema<string | undefined> {
  return Yup.string().trim().required(getString('cd.pipelineSteps.serviceTab.serviceIsRequired'))
}

export function getEnvironmentRefSchema(
  getString: UseStringsReturn['getString']
): Yup.StringSchema<string | undefined> {
  return Yup.string().trim().required(getString('cd.pipelineSteps.environmentTab.environmentIsRequired'))
}

export function getServiceDeploymentTypeSchema(
  getString: UseStringsReturn['getString']
): Yup.StringSchema<string | undefined> {
  return Yup.string()
    .oneOf(Object.values(ServiceDeploymentType))
    .required(getString('cd.pipelineSteps.serviceTab.deploymentTypeRequired'))
}

export function getInfraDeploymentTypeSchema(
  getString: UseStringsReturn['getString']
): Yup.StringSchema<string | undefined> {
  return Yup.string()
    .oneOf(Object.values(InfraDeploymentType))
    .required(getString('cd.pipelineSteps.infraTab.deploymentType'))
}

const getInfrastructureDefinitionValidationSchema = (
  deploymentType: GetExecutionStrategyYamlQueryParams['serviceDefinitionType'],
  getString: UseStringsReturn['getString']
) => {
  if (isServerlessDeploymentType(deploymentType)) {
    if (deploymentType === ServiceDeploymentType.ServerlessAwsLambda) {
      return getValidationSchemaWithRegion(getString)
    } else {
      return getValidationSchema(getString)
    }
  } else {
    return Yup.object().shape({
      connectorRef: getConnectorSchema(getString),
      namespace: getNameSpaceSchema(getString),
      releaseName: getReleaseNameSchema(getString),
      cluster: Yup.mixed().test({
        test(val): boolean | Yup.ValidationError {
          const infraDeploymentType = get(this.options.context, 'spec.infrastructure.infrastructureDefinition.type')
          if (infraDeploymentType === InfraDeploymentType.KubernetesGcp) {
            if (isEmpty(val) || (typeof val === 'object' && isEmpty(val.value))) {
              return this.createError({
                message: getString('fieldRequired', { field: getString('common.cluster') })
              })
            }
          }
          return true
        }
      })
    })
  }
}

export function getCDStageValidationSchema(
  getString: UseStringsReturn['getString'],
  deploymentType: GetExecutionStrategyYamlQueryParams['serviceDefinitionType'],
  contextType?: string
): Yup.Schema<unknown> {
  return Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, contextType),
    spec: Yup.object().shape({
      serviceConfig: Yup.object().shape({
        serviceRef: getServiceRefSchema(getString),
        serviceDefinition: Yup.object().shape({
          type: getServiceDeploymentTypeSchema(getString),
          spec: Yup.object().shape(getVariablesValidationField(getString))
        })
      }),
      infrastructure: Yup.object().shape({
        environmentRef: getEnvironmentRefSchema(getString),
        infrastructureDefinition: Yup.object().shape({
          type: getInfraDeploymentTypeSchema(getString),
          spec: getInfrastructureDefinitionValidationSchema(deploymentType, getString)
        })
      }),
      execution: Yup.object().shape({
        steps: Yup.array().required().min(1, getString('cd.pipelineSteps.executionTab.stepsCount'))
      })
    }),
    failureStrategies: getFailureStrategiesValidationSchema(getString),
    ...getVariablesValidationField(getString)
  })
}
