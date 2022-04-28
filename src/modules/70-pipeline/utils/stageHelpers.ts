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
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
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

const isPrimaryArtifactFieldPresent = (stage: DeploymentStageElementConfigWrapper, fieldName: string): boolean => {
  // return true because if artifact itself is not present then some field inside artifact would not be present
  // And that is fine as artifact itself is optional field.
  // Only when artifact is present and some of its required field is not present we need to show error and stop save precess
  if (!stage.stage?.spec?.serviceConfig.serviceDefinition?.spec.artifacts?.primary) {
    return true
  }
  const primaryArtifactSpecField =
    stage.stage?.spec?.serviceConfig.serviceDefinition?.spec.artifacts?.primary?.spec[fieldName]
  return primaryArtifactSpecField && primaryArtifactSpecField.toString().trim().length > 0
}

const isPrimaryArtifactFieldPresentInPropagatedStage = (
  stage: DeploymentStageElementConfigWrapper,
  fieldName: string
): boolean => {
  const primaryArtifactSpecField = stage.stage?.spec?.serviceConfig.stageOverrides?.artifacts?.primary?.spec[fieldName]
  return primaryArtifactSpecField && primaryArtifactSpecField.toString().trim().length > 0
}

const isManifestFieldPresent = (stage: DeploymentStageElementConfigWrapper): boolean => {
  return !!stage.stage?.spec?.serviceConfig.serviceDefinition?.spec.manifests?.length
}

const isManifestFieldPresentInPropagatedStage = (stage: DeploymentStageElementConfigWrapper): boolean => {
  if (!stage.stage?.spec?.serviceConfig.stageOverrides?.manifests) {
    return true
  }
  return !!stage.stage?.spec?.serviceConfig.stageOverrides?.manifests?.length
}

const validateServerlessArtifactsManifestsForPropagatedStage = (
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
    if (!isManifestFieldPresentInPropagatedStage(stage)) {
      return 'pipeline.artifactsSelection.validation.manifestRequiredForStage'
    }
    if (
      stage.stage.spec?.serviceConfig.stageOverrides?.artifacts?.primary &&
      !isPrimaryArtifactFieldPresentInPropagatedStage(stage, 'artifactDirectory')
    ) {
      return 'pipeline.artifactsSelection.validation.artifactDirectory'
    }
    if (
      stage.stage.spec?.serviceConfig.stageOverrides?.artifacts?.primary &&
      !isPrimaryArtifactFieldPresentInPropagatedStage(stage, 'artifactPath')
    ) {
      if (!isPrimaryArtifactFieldPresentInPropagatedStage(stage, 'artifactPathFilter')) {
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

const validateServerlessArtifactsManifestsForStage = (
  stages: DeploymentStageElementConfigWrapper[],
  stage: DeploymentStageElementConfigWrapper
): string => {
  // When the stage is prapagated from other stage
  if (stage.stage?.spec?.serviceConfig?.useFromStage) {
    return validateServerlessArtifactsManifestsForPropagatedStage(stages, stage)
  } else {
    if (isServerlessDeploymentType(stage.stage?.spec?.serviceConfig?.serviceDefinition?.type as string)) {
      if (!isManifestFieldPresent(stage)) {
        return 'pipeline.artifactsSelection.validation.manifestRequiredForStage'
      }
      if (!isPrimaryArtifactFieldPresent(stage, 'artifactDirectory')) {
        return 'pipeline.artifactsSelection.validation.artifactDirectory'
      }
      if (!isPrimaryArtifactFieldPresent(stage, 'artifactPath')) {
        if (!isPrimaryArtifactFieldPresent(stage, 'artifactPathFilter')) {
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
      const stageArtifactValidationError = validateServerlessArtifactsManifestsForStage(stages, currStage)
      if (stageArtifactValidationError) {
        return stageArtifactValidationError
      }
    }
  }
  return ''
}

export const validateServerlessArtifactsManifests = ({
  pipeline,
  getString
}: ValidateServerlessArtifactsProps): string => {
  const flattenedStages = getFlattenedStages(pipeline).stages
  if (pipeline.stages) {
    for (const currStage of pipeline.stages) {
      const stageArtifactValidationError = validateServerlessArtifactsManifestsForStage(
        flattenedStages as DeploymentStageElementConfigWrapper[],
        currStage as DeploymentStageElementConfigWrapper
      )

      if (stageArtifactValidationError.trim().length > 0) {
        return getString(stageArtifactValidationError as keyof StringsMap, { stageName: currStage.stage?.name })
      }
    }
  }
  return ''
}

export const isArtifactManifestPresent = (stage: DeploymentStageElementConfig): boolean => {
  return (
    !!stage.spec?.serviceConfig &&
    (!!stage.spec?.serviceConfig.serviceDefinition?.spec.artifacts ||
      !!stage.spec?.serviceConfig.serviceDefinition?.spec.manifests)
  )
}

export const isInfraDefinitionPresent = (stage: DeploymentStageElementConfig): boolean => {
  return !!stage.spec?.infrastructure?.infrastructureDefinition
}

export const isExecutionFieldPresent = (stage: DeploymentStageElementConfig): boolean => {
  return !!(stage.spec?.execution && stage.spec?.execution.steps && stage.spec?.execution.steps?.length > 0)
}

export const doesStageContainOtherData = (stage?: DeploymentStageElementConfig): boolean => {
  if (!stage) {
    return false
  }
  return isArtifactManifestPresent(stage) || isInfraDefinitionPresent(stage) || isExecutionFieldPresent(stage)
}

export const deleteStageData = (stage?: DeploymentStageElementConfig): void => {
  if (stage) {
    delete stage?.spec?.serviceConfig?.serviceDefinition?.spec.artifacts
    delete stage?.spec?.serviceConfig?.serviceDefinition?.spec.manifests
    delete stage?.spec?.infrastructure?.allowSimultaneousDeployments
    delete stage?.spec?.infrastructure?.infrastructureDefinition
    if (stage?.spec?.execution?.steps) {
      stage.spec.execution.steps.splice(0)
    }
    delete stage?.spec?.execution?.rollbackSteps
  }
}

export const infraDefinitionTypeMapping: { [key: string]: string } = {
  ServerlessAwsLambda: 'ServerlessAwsInfra'
}

export const getStepTypeByDeploymentType = (deploymentType: string): StepType => {
  if (isServerlessDeploymentType(deploymentType)) {
    return StepType.ServerlessAwsLambda
  }
  return StepType.K8sServiceSpec
}
