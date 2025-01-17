/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { FormInput, MultiTypeInputType } from '@harness/uicore'
import { defaultTo, get } from 'lodash-es'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { GitConfigDTO } from 'services/cd-ng'
import { ManifestToConnectorMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { Scope } from '@common/interfaces/SecretsInterface'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled, shouldDisplayRepositoryName } from '../ManifestSourceUtils'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

const ManifestGitStoreRuntimeFields = ({
  template,
  initialValues,
  path,
  manifestPath,
  manifest,
  fromTrigger,
  allowableTypes,
  accountId,
  projectIdentifier,
  orgIdentifier,
  readonly,
  repoIdentifier,
  branch,
  formik,
  stageIdentifier
}: ManifestSourceRenderProps): React.ReactElement => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [showRepoName, setShowRepoName] = useState(true)
  const isFieldDisabled = (fieldName: string): boolean => {
    // /* instanbul ignore else */
    if (readonly) {
      return true
    }
    return isFieldfromTriggerTabDisabled(
      fieldName,
      formik,
      stageIdentifier,
      manifest?.identifier as string,
      fromTrigger
    )
  }
  return (
    <>
      {isFieldRuntime(`${manifestPath}.spec.store.spec.connectorRef`, template) && (
        <div data-name="connectorRefContainer" className={css.verticalSpacingInput}>
          <FormMultiTypeConnectorField
            disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.connectorRef`)}
            name={`${path}.${manifestPath}.spec.store.spec.connectorRef`}
            selected={get(initialValues, `${manifestPath}.spec.store.spec.connectorRef`, '')}
            label={getString('connector')}
            placeholder={''}
            setRefValue
            multiTypeProps={{
              allowableTypes,
              expressions
            }}
            width={391}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            type={ManifestToConnectorMap[defaultTo(manifest?.spec.store.type, '')]}
            onChange={(selected, _itemType, multiType) => {
              const item = selected as unknown as { record?: GitConfigDTO; scope: Scope }
              if (multiType === MultiTypeInputType.FIXED) {
                if (shouldDisplayRepositoryName(item)) {
                  setShowRepoName(false)
                } else {
                  setShowRepoName(true)
                }
              }
            }}
            gitScope={{
              repo: defaultTo(repoIdentifier, ''),
              branch: defaultTo(branch, ''),
              getDefaultFromOtherRepo: true
            }}
          />
        </div>
      )}

      {isFieldRuntime(`${manifestPath}.spec.store.spec.repoName`, template) && showRepoName && (
        <div className={css.verticalSpacingInput}>
          <FormInput.MultiTextInput
            disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.repoName`)}
            name={`${path}.${manifestPath}.spec.store.spec.repoName`}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            label={getString('common.repositoryName')}
          />
        </div>
      )}

      {isFieldRuntime(`${manifestPath}.spec.store.spec.branch`, template) && (
        <div className={css.verticalSpacingInput}>
          <FormInput.MultiTextInput
            disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.branch`)}
            name={`${path}.${manifestPath}.spec.store.spec.branch`}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            label={getString('pipelineSteps.deploy.inputSet.branch')}
          />
        </div>
      )}
      {isFieldRuntime(`${manifestPath}.spec.store.spec.commitId`, template) && (
        <div className={css.verticalSpacingInput}>
          <FormInput.MultiTextInput
            disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.commitId`)}
            name={`${path}.${manifestPath}.spec.store.spec.commitId`}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            label={getString('pipelineSteps.commitIdValue')}
          />
        </div>
      )}
    </>
  )
}
export default ManifestGitStoreRuntimeFields
