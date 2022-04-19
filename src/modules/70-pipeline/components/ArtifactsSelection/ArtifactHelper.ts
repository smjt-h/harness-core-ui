/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Schema } from 'yup'
import type { IconName } from '@wings-software/uicore'
import type { IOptionProps } from '@blueprintjs/core'
import { IdentifierSchemaWithOutName } from '@common/utils/Validation'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO, ServiceDefinition } from 'services/cd-ng'
import type { StringKeys } from 'framework/strings'
import { useStrings } from 'framework/strings'

import type { ArtifactType } from './ArtifactInterface'

export enum ModalViewFor {
  PRIMARY = 1,
  SIDECAR = 2
}

export const ArtifactIconByType: Record<ArtifactType, IconName> = {
  DockerRegistry: 'service-dockerhub',
  Gcr: 'service-gcp',
  Ecr: 'ecr-step',
  Nexus3Registry: 'service-nexus',
  ArtifactoryRegistry: 'service-artifactory',
  CustomArtifact: 'custom-artifact',
  Acr: 'service-azure'
}
export const ArtifactTitleIdByType: Record<ArtifactType, StringKeys> = {
  DockerRegistry: 'dockerRegistry',
  Gcr: 'connectors.GCR.name',
  Ecr: 'connectors.ECR.name',
  Nexus3Registry: 'connectors.nexus.nexusLabel',
  ArtifactoryRegistry: 'connectors.artifactory.artifactoryLabel',
  CustomArtifact: 'common.repo_provider.customLabel',
  Acr: 'pipeline.ACR.name'
}

export const ENABLED_ARTIFACT_TYPES: { [key: string]: ArtifactType } = {
  DockerRegistry: 'DockerRegistry',
  Gcr: 'Gcr',
  Ecr: 'Ecr',
  Nexus3Registry: 'Nexus3Registry',
  ArtifactoryRegistry: 'ArtifactoryRegistry',
  CustomArtifact: 'CustomArtifact',
  Acr: 'Acr'
}

export const ArtifactToConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  DockerRegistry: Connectors.DOCKER,
  Gcr: Connectors.GCP,
  Ecr: Connectors.AWS,
  Nexus3Registry: Connectors.NEXUS,
  ArtifactoryRegistry: Connectors.ARTIFACTORY,
  Acr: Connectors.AZURE
}

export const ArtifactConnectorLabelMap: Record<string, string> = {
  DockerRegistry: 'Docker Registry',
  Gcr: 'GCP',
  Ecr: 'AWS',
  Nexus3Registry: 'Nexus',
  ArtifactoryRegistry: 'Artifactory',
  Azure: 'Azure'
}

export const allowedArtifactTypes: Record<ServiceDefinition['type'], Array<ArtifactType>> = {
  Kubernetes: [ENABLED_ARTIFACT_TYPES.DockerRegistry, ENABLED_ARTIFACT_TYPES.Gcr, ENABLED_ARTIFACT_TYPES.Ecr],
  NativeHelm: [ENABLED_ARTIFACT_TYPES.DockerRegistry, ENABLED_ARTIFACT_TYPES.Gcr, ENABLED_ARTIFACT_TYPES.Ecr],
  Ssh: [],
  WinRm: []
}

export const tagOptions: IOptionProps[] = [
  {
    label: 'Value',
    value: 'value'
  },
  {
    label: 'Regex',
    value: 'regex'
  }
]

export const repositoryPortOrServer: IOptionProps[] = [
  {
    label: 'Repository URL',
    value: 'repositoryUrl'
  },
  {
    label: 'Repository Port',
    value: 'repositoryPort'
  }
]

export const ArtifactIdentifierValidation = (
  artifactIdentifiers: string[],
  id: string | undefined,
  validationMsg: string
): { identifier: Schema<unknown> } => {
  const { getString } = useStrings()

  if (!id) {
    return {
      identifier: IdentifierSchemaWithOutName(getString).notOneOf(artifactIdentifiers, validationMsg)
    }
  }
  return {
    identifier: IdentifierSchemaWithOutName(getString)
  }
}
