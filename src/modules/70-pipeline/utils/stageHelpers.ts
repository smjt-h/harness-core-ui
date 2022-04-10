/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get, isEmpty } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import type { GraphLayoutNode, PipelineExecutionSummary } from 'services/pipeline-ng'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import type {
  Infrastructure,
  GetExecutionStrategyYamlQueryParams,
  PipelineInfoConfig,
  StageElementConfig,
  ServerlessAwsLambdaInfrastructure
} from 'services/cd-ng'
import { connectorTypes } from '@pipeline/utils/constants'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { getFlattenedStages } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { StringsMap } from 'framework/strings/StringsContext'
import type { InputSetDTO } from './types'
import type {
  DeploymentStageElementConfig,
  DeploymentStageElementConfigWrapper,
  PipelineStageWrapper,
  StageElementWrapper
} from './pipelineTypes'

export enum StageType {
  DEPLOY = 'Deployment',
  BUILD = 'CI',
  FEATURE = 'FeatureFlag',
  PIPELINE = 'Pipeline',
  APPROVAL = 'Approval',
  CUSTOM = 'Custom',
  Template = 'Template',
  SECURITY = 'Security'
}

export enum ServiceDeploymentType {
  Kubernetes = 'Kubernetes',
  NativeHelm = 'NativeHelm',
  amazonEcs = 'amazonEcs',
  amazonAmi = 'amazonAmi',
  awsCodeDeploy = 'awsCodeDeploy',
  winrm = 'winrm',
  awsLambda = 'awsLambda',
  pcf = 'pcf',
  ssh = 'ssh',
  ServerlessAwsLambda = 'ServerlessAwsLambda',
  ServerlessAzureFunctions = 'ServerlessAzureFunctions',
  ServerlessGoogleFunctions = 'ServerlessGoogleFunctions',
  AmazonSAM = 'AwsSAM',
  AzureFunctions = 'AzureFunctions'
}

export type ServerlessGCPInfrastructure = Infrastructure & {
  connectorRef: string
  metadata?: string
  stage: string
}

export type ServerlessAzureInfrastructure = Infrastructure & {
  connectorRef: string
  metadata?: string
  stage: string
}
export type ServerlessInfraTypes =
  | ServerlessGCPInfrastructure
  | ServerlessAzureInfrastructure
  | ServerlessAwsLambdaInfrastructure

interface ValidateServerlessArtifactsProps {
  pipeline: PipelineInfoConfig
  getString: UseStringsReturn['getString']
}

export const changeEmptyValuesToRunTimeInput = (inputset: any, propertyKey: string): InputSetDTO => {
  if (inputset) {
    Object.keys(inputset).forEach(key => {
      if (typeof inputset[key] === 'object') {
        changeEmptyValuesToRunTimeInput(inputset[key], key)
      } else if (inputset[key] === '' && ['tags'].indexOf(propertyKey) === -1) {
        inputset[key] = '<+input>'
      }
    })
  }
  return inputset
}

export function isCDStage(node?: GraphLayoutNode): boolean {
  return node?.nodeType === StageType.DEPLOY || node?.module === 'cd' || !isEmpty(node?.moduleInfo?.cd)
}

export function isCIStage(node?: GraphLayoutNode): boolean {
  return node?.nodeType === StageType.BUILD || node?.module === 'ci' || !isEmpty(node?.moduleInfo?.ci)
}

export function hasCDStage(pipelineExecution?: PipelineExecutionSummary): boolean {
  return pipelineExecution?.modules?.includes('cd') || !isEmpty(pipelineExecution?.moduleInfo?.cd)
}

export function hasCIStage(pipelineExecution?: PipelineExecutionSummary): boolean {
  return pipelineExecution?.modules?.includes('ci') || !isEmpty(pipelineExecution?.moduleInfo?.ci)
}

export const getHelperTextString = (
  invalidFields: string[],
  getString: (key: StringKeys) => string,
  isServerlessDeploymentTypeSelected = false
): string => {
  return `${invalidFields.length > 1 ? invalidFields.join(', ') : invalidFields[0]} ${
    invalidFields.length > 1 ? ' are ' : ' is '
  } ${
    isServerlessDeploymentTypeSelected
      ? getString('pipeline.artifactPathDependencyRequired')
      : getString('pipeline.tagDependencyRequired')
  }`
}

export const getHelpeTextForTags = (
  fields: {
    imagePath?: string
    artifactPath?: string
    region?: string
    connectorRef: string
    registryHostname?: string
    repository?: string
    repositoryPort?: number
    artifactDirectory?: string
  },
  getString: (key: StringKeys) => string,
  isServerlessDeploymentTypeSelected = false
): string => {
  const {
    connectorRef,
    region,
    imagePath,
    artifactPath,
    registryHostname,
    repository,
    repositoryPort,
    artifactDirectory
  } = fields
  const invalidFields: string[] = []
  if (!connectorRef || getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME) {
    invalidFields.push(getString('connector'))
  }
  if (region !== undefined && (!region || getMultiTypeFromValue(region) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('regionLabel'))
  }
  if (
    registryHostname !== undefined &&
    (!registryHostname || getMultiTypeFromValue(registryHostname) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('connectors.GCR.registryHostname'))
  }
  if (
    !isServerlessDeploymentTypeSelected &&
    (imagePath === '' || getMultiTypeFromValue(imagePath) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.imagePathLabel'))
  }
  if (
    !isServerlessDeploymentTypeSelected &&
    (artifactPath === '' || getMultiTypeFromValue(artifactPath) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.artifactPathLabel'))
  }
  if (repository !== undefined && (!repository || getMultiTypeFromValue(repository) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('repository'))
  }
  if (
    repositoryPort !== undefined &&
    (!repositoryPort || getMultiTypeFromValue(repositoryPort) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.artifactsSelection.repositoryPort'))
  }
  if (
    isServerlessDeploymentTypeSelected &&
    (!artifactDirectory || getMultiTypeFromValue(artifactDirectory) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('pipeline.artifactsSelection.artifactDirectory'))
  }

  const helpText = getHelperTextString(invalidFields, getString, isServerlessDeploymentTypeSelected)

  return invalidFields.length > 0 ? helpText : ''
}

export const isServerlessDeploymentType = (deploymentType: string): boolean => {
  return (
    deploymentType === ServiceDeploymentType.ServerlessAwsLambda ||
    deploymentType === ServiceDeploymentType.ServerlessAzureFunctions ||
    deploymentType === ServiceDeploymentType.ServerlessGoogleFunctions ||
    deploymentType === ServiceDeploymentType.AmazonSAM ||
    deploymentType === ServiceDeploymentType.AzureFunctions
  )
}

export const detailsHeaderName: Record<string, string> = {
  [ServiceDeploymentType.ServerlessAwsLambda]: 'Amazon Web Services Details',
  [ServiceDeploymentType.ServerlessAzureFunctions]: 'Azure Details',
  [ServiceDeploymentType.ServerlessGoogleFunctions]: 'GCP Details'
}

export const isServerlessManifestType = (selectedManifest: ManifestTypes | null): boolean => {
  return selectedManifest === ManifestDataType.ServerlessAwsLambda
}

export const getSelectedDeploymentType = (
  stage: StageElementWrapper<DeploymentStageElementConfig> | undefined,
  getStageFromPipeline: <T extends StageElementConfig = StageElementConfig>(
    stageId: string,
    pipeline?: PipelineInfoConfig | undefined
  ) => PipelineStageWrapper<T>,
  isPropagating = false
): GetExecutionStrategyYamlQueryParams['serviceDefinitionType'] => {
  if (isPropagating) {
    const parentStageId = get(stage, 'stage.spec.serviceConfig.useFromStage.stage', null)
    const parentStage = getStageFromPipeline<DeploymentStageElementConfig>(defaultTo(parentStageId, ''))
    return get(parentStage, 'stage.stage.spec.serviceConfig.serviceDefinition.type', null)
  }
  return get(stage, 'stage.spec.serviceConfig.serviceDefinition.type', null)
}

export const getCustomStepProps = (type: string, getString: (key: StringKeys) => string) => {
  switch (type) {
    case ServiceDeploymentType.ServerlessAwsLambda:
      return {
        hasRegion: true,
        formInfo: {
          formName: 'serverlessAWSInfra',
          type: connectorTypes.Aws,
          header: getString('pipelineSteps.awsConnectorLabel'),
          tooltipIds: {
            connector: 'awsInfraConnector',
            region: 'awsRegion',
            stage: 'awsStage'
          }
        }
      }
    case ServiceDeploymentType.ServerlessAzureFunctions:
      return {
        formInfo: {
          formName: 'serverlessAzureInfra',
          // @TODO - (change type to 'azure')
          // this is not being used anywhere currently, once azure support is there we will change it.
          type: connectorTypes.Gcp,
          header: getString('pipelineSteps.awsConnectorLabel'),
          tooltipIds: {
            connector: 'azureInfraConnector',
            region: 'azureRegion',
            stage: 'azureStage'
          }
        }
      }
    case ServiceDeploymentType.ServerlessGoogleFunctions:
      return {
        formInfo: {
          formName: 'serverlessGCPInfra',
          type: connectorTypes.Gcp,
          header: getString('pipelineSteps.gcpConnectorLabel'),
          tooltipIds: {
            connector: 'gcpInfraConnector',
            region: 'gcpRegion',
            stage: 'gcpStage'
          }
        }
      }
    default:
      return { formInfo: {} }
  }
}

const isArtifactFieldPresent = (stage: DeploymentStageElementConfigWrapper, fieldName: string): boolean => {
  const primaryArtifactSpecField =
    stage.stage?.spec?.serviceConfig.serviceDefinition?.spec.artifacts?.primary?.spec[fieldName]
  return primaryArtifactSpecField && primaryArtifactSpecField.toString().trim().length > 0
}

const isArtifactFieldPresentInPropagatedStage = (
  stage: DeploymentStageElementConfigWrapper,
  fieldName: string
): boolean => {
  const primaryArtifactSpecField = stage.stage?.spec?.serviceConfig.stageOverrides?.artifacts?.primary?.spec[fieldName]
  return primaryArtifactSpecField && primaryArtifactSpecField.toString().trim().length > 0
}

const validateServerlessArtifactsForPropagatedStage = (
  stages: DeploymentStageElementConfigWrapper[],
  stage: DeploymentStageElementConfigWrapper
): string => {
  // Stage from which current stage is propagated
  const propagateFromStage = stages.find(
    currStage => currStage.stage?.identifier === stage.stage?.spec?.serviceConfig?.useFromStage?.stage
  )
  if (isServerlessDeploymentType(propagateFromStage?.stage?.spec?.serviceConfig?.serviceDefinition?.type as string)) {
    // When artifacts / manifests are overriden over the propagate (previous) stage, else do not validate for fields
    // as fields are already validated in propagate (previous) stage
    if (
      stage.stage.spec?.serviceConfig.stageOverrides &&
      !isArtifactFieldPresentInPropagatedStage(stage, 'artifactDirectory')
    ) {
      return 'pipeline.artifactsSelection.validation.artifactDirectory'
    }
    if (
      stage.stage.spec?.serviceConfig.stageOverrides &&
      !isArtifactFieldPresentInPropagatedStage(stage, 'artifactPath')
    ) {
      if (!isArtifactFieldPresentInPropagatedStage(stage, 'artifactPathFilter')) {
        return 'pipeline.artifactsSelection.validation.artifactPathAndArtifactPathFilter'
      } else {
        return ''
      }
    } else {
      return ''
    }
  }
  return ''
}

const validateServerlessArtifactsForStage = (
  stages: DeploymentStageElementConfigWrapper[],
  stage: DeploymentStageElementConfigWrapper
): string => {
  // When the stage is prapagated from other stage
  if (stage.stage?.spec?.serviceConfig?.useFromStage) {
    return validateServerlessArtifactsForPropagatedStage(stages, stage)
  } else {
    if (isServerlessDeploymentType(stage.stage?.spec?.serviceConfig?.serviceDefinition?.type as string)) {
      if (!isArtifactFieldPresent(stage, 'artifactDirectory')) {
        return 'pipeline.artifactsSelection.validation.artifactDirectory'
      }
      if (!isArtifactFieldPresent(stage, 'artifactPath')) {
        if (!isArtifactFieldPresent(stage, 'artifactPathFilter')) {
          return 'pipeline.artifactsSelection.validation.artifactPathAndArtifactPathFilter'
        } else {
          return ''
        }
      } else {
        return ''
      }
    }
  }

  if (stage.parallel) {
    for (const currStage of stage.parallel) {
      const stageArtifactValidationError = validateServerlessArtifactsForStage(stages, currStage)
      if (stageArtifactValidationError) {
        return stageArtifactValidationError
      }
    }
  }
  return ''
}

export const validateServerlessArtifacts = ({ pipeline, getString }: ValidateServerlessArtifactsProps): string => {
  const flattenedStages = getFlattenedStages(pipeline).stages
  for (
    let stageIndex = 0;
    stageIndex < (pipeline.stages as DeploymentStageElementConfigWrapper[])?.length;
    stageIndex++
  ) {
    const currStage: DeploymentStageElementConfigWrapper = pipeline.stages?.[
      stageIndex
    ] as DeploymentStageElementConfigWrapper

    const stageArtifactValidationError = validateServerlessArtifactsForStage(
      flattenedStages as DeploymentStageElementConfigWrapper[],
      currStage
    )

    if (stageArtifactValidationError.trim().length > 0) {
      return getString(stageArtifactValidationError as keyof StringsMap)
    }
  }
  return ''
}
