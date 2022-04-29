/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import type { FormikValues } from 'formik'
import type { GetDataError } from 'restful-react'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type {
  ArtifactConfig,
  PrimaryArtifact,
  PageConnectorResponse,
  SidecarArtifactWrapper,
  DockerBuildDetailsDTO,
  Failure,
  Error,
  ArtifactoryBuildDetailsDTO
} from 'services/cd-ng'

export interface ArtifactListViewProps {
  isForPredefinedSets?: boolean
  stage: StageElementWrapper<DeploymentStageElementConfig> | undefined
  overrideSetIdentifier?: string
  primaryArtifact: PrimaryArtifact
  sideCarArtifact: SidecarArtifactWrapper[] | undefined
  addNewArtifact: (view: number) => void
  editArtifact: (view: number, type: ArtifactType, index?: number) => void
  removePrimary: () => void
  removeSidecar: (index: number) => void
  fetchedConnectorResponse: PageConnectorResponse | undefined
  accountId: string
  refetchConnectors: () => void
  isReadonly: boolean
  allowSidecar?: boolean
}
export interface ArtifactsSelectionProps {
  isForOverrideSets?: boolean
  isForPredefinedSets?: boolean
  identifierName?: string
  isPropagating?: boolean
  overrideSetIdentifier?: string
}

export type ArtifactType =
  | 'DockerRegistry'
  | 'Gcr'
  | 'Ecr'
  | 'Nexus3Registry'
  | 'ArtifactoryRegistry'
  | 'CustomArtifact'
  | 'Acr'
export interface OrganizationCreationType {
  type: ArtifactType
}
export enum TagTypes {
  Value = 'value',
  Regex = 'regex'
}
export enum RepositoryPortOrServer {
  RepositoryPort = 'repositoryPort',
  RepositoryUrl = 'repositoryUrl'
}
export interface InitialArtifactDataType {
  submittedArtifact?: ArtifactType | null
  connectorId: string | undefined | ConnectorSelectedValue
}
export interface ImagePathTypes {
  identifier: string
  imagePath?: string
  artifactPath?: string
  tag: any
  tagRegex: any
  tagType: TagTypes
  registryHostname?: string
  region?: any
  repositoryPort?: number | string
  repository?: string | SelectOption
  repositoryUrl?: string
  repositoryPortorRepositoryURL?: string
  artifactDirectory?: string
}

export interface CustomArtifactSource extends ImagePathTypes {
  version: string
}

export interface ImagePathProps {
  key: string
  name: string
  expressions: string[]
  context: number
  initialValues: ImagePathTypes
  handleSubmit: (data: ArtifactConfig) => void
  artifactIdentifiers: string[]
  isReadonly?: boolean
  selectedArtifact: ArtifactType | null
  allowableTypes: MultiTypeInputType[]
  selectedDeploymentType: string
}

export interface ConnectorRefLabelType {
  firstStepName: string
  secondStepName: string
}

export interface ArtifactTagHelperText {
  imagePath?: string
  artifactPath?: string
  region?: string
  connectorRef: string
  registryHostname?: string
  repository?: string
  repositoryPort?: number
  artifactDirectory?: string
}
export interface ArtifactImagePathTagViewProps {
  selectedArtifact: ArtifactType
  formik: FormikValues
  expressions: string[]
  isReadonly?: boolean
  allowableTypes: MultiTypeInputType[]
  connectorIdValue: string
  fetchTags: (val: string) => void
  buildDetailsLoading: boolean
  tagList: DockerBuildDetailsDTO[] | ArtifactoryBuildDetailsDTO[] | undefined
  setTagList: any
  tagError: GetDataError<Failure | Error> | null
  tagDisabled: boolean
  isArtifactPath?: boolean
  isServerlessDeploymentTypeSelected?: boolean
}
