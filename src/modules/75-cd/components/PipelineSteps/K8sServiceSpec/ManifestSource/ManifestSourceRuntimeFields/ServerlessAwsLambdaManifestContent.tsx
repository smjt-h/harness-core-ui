/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { FormInput, Layout } from '@harness/uicore'
import { StringKeys, useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import List from '@common/components/List/List'
import type { ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '../ManifestSourceUtils'
import ManifestGitStoreRuntimeFields from './ManifestGitStoreRuntimeFields'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

export interface ServerlessAwsLambdaManifestRenderProps extends ManifestSourceRenderProps {
  pathFieldlabel: StringKeys
}
const ServerlessAwsLambdaManifestContent = (props: ServerlessAwsLambdaManifestRenderProps): React.ReactElement => {
  const { template, path, manifestPath, manifest, fromTrigger, readonly, formik, stageIdentifier, pathFieldlabel } =
    props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

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
    <Layout.Vertical
      data-name="manifest"
      key={manifest?.identifier}
      className={cx(css.inputWidth, css.layoutVerticalSpacing)}
    >
      <ManifestGitStoreRuntimeFields {...props} />

      {isFieldRuntime(`${manifestPath}.spec.store.spec.paths`, template) && (
        <div className={css.verticalSpacingInput}>
          <List
            labelClassName={css.listLabel}
            label={getString(pathFieldlabel)}
            name={`${path}.${manifestPath}.spec.store.spec.paths`}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.paths`)}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            isNameOfArrayType
            allowOnlyOne
          />
        </div>
      )}

      {isFieldRuntime(`${manifestPath}.spec.configOverridePath`, template) && (
        <div className={css.verticalSpacingInput}>
          <FormInput.MultiTextInput
            disabled={isFieldDisabled(`${manifestPath}.spec.configOverridePath`)}
            multiTextInputProps={{ expressions, allowableTypes: props.allowableTypes }}
            label={getString('pipeline.manifestType.serverlessConfigFilePath')}
            placeholder={getString('pipeline.manifestType.serverlessConfigFilePathPlaceholder')}
            name={`${path}.${manifestPath}.spec.configOverridePath`}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}

export default ServerlessAwsLambdaManifestContent
