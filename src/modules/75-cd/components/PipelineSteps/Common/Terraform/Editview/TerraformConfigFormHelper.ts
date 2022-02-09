/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import * as Yup from 'yup'
import { cloneDeep, set } from 'lodash-es'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { StringKeys } from 'framework/strings'
import {
  buildBitbucketPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload,
  buildArtifactoryPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'

export const AllowedTypes = ['Git', 'Github', 'GitLab', 'Bitbucket', 'Artifactory']
export type ConnectorTypes = 'Git' | 'Github' | 'GitLab' | 'Bitbucket' | 'Artifactory'

export const tfVarIcons: any = {
  Git: 'service-github',
  Github: 'github',
  GitLab: 'service-gotlab',
  Bitbucket: 'bitbucket',
  Artifactory: 'service-artifactory'
}

export const ConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET,
  Artifactory: Connectors.ARTIFACTORY
}

export const ConnectorLabelMap: Record<ConnectorTypes, StringKeys> = {
  Git: 'pipeline.manifestType.gitConnectorLabel',
  Github: 'common.repo_provider.githubLabel',
  GitLab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'pipeline.manifestType.bitBucketLabel',
  Artifactory: 'connectors.artifactory.artifactoryLabel'
}

export const formInputNames = (isTerraformPlan: boolean) => ({
  connectorRef: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.connectorRef'
    : 'spec.configuration.spec.configFiles.store.spec.connectorRef',
  repoName: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.repoName'
    : 'spec.configuration.spec.configFiles.store.spec.repoName',
  gitFetchType: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.gitFetchType'
    : 'spec.configuration.spec.configFiles.store.spec.gitFetchType',
  branch: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.branch'
    : 'spec.configuration.spec.configFiles.store.spec.branch',
  commitId: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.commitId'
    : 'spec.configuration.spec.configFiles.store.spec.commitId',
  folderPath: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.folderPath'
    : 'spec.configuration.spec.configFiles.store.spec.folderPath',
  repositoryName: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.repositoryName'
    : 'spec.configuration.spec.configFiles.store.spec.repositoryName'
})

export const formikOnChangeNames = (isTerraformPlan: boolean) => ({
  repoName: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.repoName'
    : 'spec.configuration.spec.configFiles.store.spec.repoName',
  branch: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.branch'
    : 'spec.configuration.spec.configFiles.store.spec.branch',
  commitId: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.commitId'
    : 'spec.configuration.spec.configFiles.spec.store.spec.commitId',
  folderPath: isTerraformPlan
    ? 'formik.values.spec.configuration.configFiles.store.spec.folderPath'
    : 'formik.values.spec.configuration.spec.store.spec.folderPath',
  artifacts: isTerraformPlan
    ? 'formik.values.spec.configuration.configFiles.store.spec.artifacts'
    : 'formik.values.spec.configuration.spec.store.spec.artifacts',
  artifactPath: isTerraformPlan
    ? 'formik.values.spec.configuration.configFiles.store.spec.artifacts.artifactFile.path'
    : 'formik.values.spec.configuration.spec.store.spec.artifacts.artifactFile.path',
  artifactName: isTerraformPlan
    ? 'formik.values.spec.configuration.configFiles.store.spec.artifacts.artifactFile.name'
    : 'formik.values.spec.configuration.spec.store.spec.artifacts.artifactFile.name',
  artifactPathExpression: isTerraformPlan
    ? 'formik.values.spec.configuration.configFiles.store.spec.artifacts.artifactFile.artifactPathExpression'
    : 'formik.values.spec.configuration.spec.store.spec.artifacts.artifactFile.artifactPathExpression'
})

export const getBuildPayload = (type: ConnectorInfoDTO['type']) => {
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
  if (type === Connectors.ARTIFACTORY) {
    return buildArtifactoryPayload
  }
  return () => ({})
}

export const stepTwoValidationSchema = (isTerraformPlan: boolean, getString: any) => {
  const configSetup = {
    configFiles: Yup.object().shape({
      store: Yup.object().shape({
        spec: Yup.object().shape({
          gitFetchType: Yup.string().required(getString('cd.gitFetchTypeRequired')),
          branch: Yup.string().when('gitFetchType', {
            is: 'Branch',
            then: Yup.string().trim().required(getString('validation.branchName'))
          }),
          commitId: Yup.string().when('gitFetchType', {
            is: 'Commit',
            then: Yup.string().trim().required(getString('validation.commitId'))
          }),
          folderPath: Yup.string().required(getString('pipeline.manifestType.folderPathRequired'))
        })
      })
    })
  }

  return isTerraformPlan
    ? Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            ...configSetup
          })
        })
      })
    : Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            spec: Yup.object().shape({
              ...configSetup
            })
          })
        })
      })
}
export const formatSubmitData = (formik: any, data: any, isTerraformPlan: boolean) => {
  const configObject = isTerraformPlan
    ? { ...data.spec?.configuration?.configFiles }
    : { ...data.spec?.configuration?.spec?.configFiles }

  if (configObject?.store.spec.gitFetchType === 'Branch') {
    delete configObject.store.spec.commitId
  } else if (configObject?.store.spec.gitFetchType === 'Commit') {
    delete configObject.store.spec.branch
  }

  if (data?.selectedType === 'Artifactory') {
    delete configObject.store.spec.commitId
    delete configObject.store.spec.branch
    delete configObject.store.spec.gitFetchType
    delete configObject.store.spec.repoName
    delete configObject.store.spec.folderPath
    const artifacts = isTerraformPlan
      ? data.formik.values.spec?.configuration?.configFiles?.store?.spec?.artifacts
      : data.formik.values.spec.configuration.spec.store.spec.artifacts
    configObject.store.spec.repositoryName = isTerraformPlan
      ? data.spec.configuration.configFiles.store.spec.repositoryName
      : data.spec?.configuration.spec.configFiles.store.spec.repositoryName
    configObject.store.spec.artifacts = [artifacts]
  }
  const valObj = cloneDeep(formik.values)
  set(valObj, 'spec.configuration.spec.configFiles', { ...configObject })
  return valObj
}

export const terraformConfigStepTwoValidationSchema = (isTerraformPlan: boolean, getString: any) => {
  const configSetup = {
    configFiles: Yup.object().shape({
      store: Yup.object().shape({
        spec: Yup.object().shape({
          gitFetchType: Yup.string().when('isArtifactory', {
            is: false,
            then: Yup.string().required(getString('cd.gitFetchTypeRequired'))
          }),
          branch: Yup.string().when('gitFetchType', {
            is: 'Branch',
            then: Yup.string().trim().required(getString('validation.branchName'))
          }),
          commitId: Yup.string().when('gitFetchType', {
            is: 'CommitId',
            then: Yup.string().trim().required(getString('validation.commitId'))
          }),
          folderPath: Yup.string().when('isArtifactory', {
            is: false,
            then: Yup.string().required(getString('pipeline.manifestType.folderPathRequired'))
          }),
          artifacts: Yup.array()
            .of(
              Yup.object().shape({
                artifactPathExpression: Yup.string().required(getString('cd.pathCannotBeEmpty')),
                name: Yup.string().required(getString('cd.pathCannotBeEmpty'))
              })
            )
            .when('isArtifactory', {
              is: true,
              then: Yup.string().required(getString('cd.pathCannotBeEmpty'))
            })
        })
      })
    })
  }

  return isTerraformPlan
    ? Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            ...configSetup
          })
        })
      })
    : Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            spec: Yup.object().shape({
              ...configSetup
            })
          })
        })
      })
}
