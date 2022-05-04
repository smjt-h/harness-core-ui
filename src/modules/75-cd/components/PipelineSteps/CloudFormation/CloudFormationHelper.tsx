/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { map, get } from 'lodash-es'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'

import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { StringKeys } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import {
  buildBitbucketPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload,
  buildAWSPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import StepGitlabAuthentication from '@connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import StepGithubAuthentication from '@connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import StepAWSAuthentication from '@connectors/components/CreateConnector/AWSConnector/StepAuth/StepAWSAuthentication'
export const AllowedTypes = ['Git', 'Github', 'GitLab', 'Bitbucket', 'S3']
export type ConnectorTypes = 'Git' | 'Github' | 'GitLab' | 'Bitbucket' | 'S3'

export const ConnectorIcons: any = {
  Git: 'service-github',
  Github: 'github',
  GitLab: 'service-gotlab',
  Bitbucket: 'bitbucket',
  S3: 's3-step'
}

export const ConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET,
  S3: Connectors.AWS
}

export const ConnectorLabelMap: Record<ConnectorTypes, StringKeys> = {
  Git: 'pipeline.manifestType.gitConnectorLabel',
  Github: 'common.repo_provider.githubLabel',
  GitLab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'pipeline.manifestType.bitBucketLabel',
  S3: 'pipelineSteps.awsConnectorLabel'
}

export const getBuildPayload = (type: ConnectorTypes) => {
  if (type === Connectors.GIT) {
    return buildGitPayload
  }
  if (type === Connectors.GITHUB) {
    return buildGithubPayload
  }
  if (type === Connectors.BITBUCKET) {
    return buildBitbucketPayload
  }
  if (type === Connectors.GITLAB) {
    return buildGitlabPayload
  }
  if (type === Connectors.AWS) {
    return buildAWSPayload
  }
  return () => ({})
}

export const GetNewConnector = (
  connectorType: string,
  isEditMode: boolean,
  setIsEditMode: (bool: boolean) => void,
  accountId: string,
  projectIdentifier: string,
  orgIdentifier: string,
  name: string
): JSX.Element | null => {
  switch (connectorType) {
    case Connectors.GIT:
      return (
        <StepGitAuthentication
          name={name}
          onConnectorCreated={() => {
            // Handle on success
          }}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          connectorInfo={undefined}
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
        />
      )
    case Connectors.GITHUB:
      return (
        <StepGithubAuthentication
          name={name}
          onConnectorCreated={() => {
            // Handle on success
          }}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          connectorInfo={undefined}
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
        />
      )
    case Connectors.GITLAB:
      return (
        <StepGitlabAuthentication
          name={name}
          identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
          onConnectorCreated={() => {
            // Handle on success
          }}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          connectorInfo={undefined}
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
        />
      )
    case Connectors.BITBUCKET:
      return (
        <StepBitbucketAuthentication
          name={name}
          onConnectorCreated={() => {
            // Handle on success
          }}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          connectorInfo={undefined}
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
        />
      )
    case Connectors.AWS:
      return (
        <StepAWSAuthentication
          name={name}
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          connectorInfo={undefined}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
        />
      )
  }
  return null
}

const formatPaths = (paths: any) => map(paths, (item: string) => ({ path: item }))

export const FormatFilePaths = (values: any, isParam: boolean, index: number) => {
  if (isParam) {
    let param = get(values, `spec.configuration.parameters[${index}]`)
    param = {
      identifier: param?.identifier,
      store: {
        spec: {
          ...param?.store?.spec,
          paths: param?.store?.spec?.paths.length > 0 ? formatPaths(param?.store?.spec?.paths) : [{ path: '' }]
        }
      }
    }
    return {
      spec: {
        configuration: {
          parameters: param
        }
      }
    }
  }
  const templateFile = get(values, 'spec.configuration.templateFile.spec.store.spec.paths')
  return {
    spec: {
      configuration: {
        templateFile: {
          spec: {
            store: {
              spec: {
                paths: formatPaths(templateFile || '')
              }
            }
          }
        }
      }
    }
  }
}

export const ConnectorStepTitle = (isParam: boolean): keyof StringsMap => {
  if (isParam) {
    return 'cd.cloudFormation.paramFileConnector'
  }
  return 'cd.cloudFormation.templateFileConnector'
}
