/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'

import { StepProps, MultiTypeInputType, getMultiTypeFromValue, FormInput, SelectOption } from '@harness/uicore'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings } from 'framework/strings'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface CFFileStoreProps {
  isParam: boolean
  allowableTypes: MultiTypeInputType[]
  index?: number
  values: any
}

export const ParameterRepoDetails: React.FC<StepProps<any> & CFFileStoreProps> = ({
  allowableTypes,
  index,
  values,
  isParam
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const gitFetchTypes: SelectOption[] = [
    { label: getString('gitFetchTypes.fromBranch'), value: getString('pipelineSteps.deploy.inputSet.branch') },
    { label: getString('gitFetchTypes.fromCommit'), value: getString('pipelineSteps.commitIdValue') }
  ]

  const template = values?.spec?.configuration?.templateFile
  const connector = values?.connector
  let param
  if (isParam && index !== undefined) {
    param = values?.spec?.configuration?.parameters
  }

  const repoName = isParam
    ? `spec.configuration.parameters.store.spec.repoName`
    : 'spec.configuration.templateFile.spec.store.spec.repoName'
  const gitFetchType = isParam
    ? `spec.configuration.parameters.store.spec.gitFetchType`
    : 'spec.configuration.templateFile.spec.store.spec.gitFetchType'
  const branch = isParam
    ? `spec.configuration.parameters.store.spec.branch`
    : 'spec.configuration.templateFile.spec.store.spec.branch'
  const commitId = isParam
    ? `spec.configuration.parameters.store.spec.commitId`
    : 'spec.configuration.templateFile.spec.store.spec.commitId'

  return (
    <>
      {(connector?.connector?.spec?.connectionType === 'Account' || connector?.connector?.spec?.type === 'Account') && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('pipelineSteps.repoName')}
            name={repoName}
            placeholder={getString('pipelineSteps.repoName')}
            multiTextInputProps={{ expressions, allowableTypes }}
          />
          {getMultiTypeFromValue(param?.store?.spec?.repoName) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ alignSelf: 'center', marginTop: 1 }}
              value={param?.store?.spec?.repoName as string}
              type="String"
              variableName={repoName}
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
            />
          )}
        </div>
      )}
      <div className={cx(stepCss.formGroup, stepCss.md)}>
        <FormInput.Select
          items={gitFetchTypes}
          name={gitFetchType}
          label={getString('pipeline.manifestType.gitFetchTypeLabel')}
          placeholder={getString('pipeline.manifestType.gitFetchTypeLabel')}
        />
      </div>
      {(param?.store?.spec?.gitFetchType === gitFetchTypes[0].value ||
        template?.spec?.store?.spec?.gitFetchType === gitFetchTypes[0].value) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('pipelineSteps.deploy.inputSet.branch')}
            placeholder={getString('pipeline.manifestType.branchPlaceholder')}
            name={branch}
            multiTextInputProps={{ expressions, allowableTypes }}
          />
          {getMultiTypeFromValue(param?.store?.spec?.branch) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ alignSelf: 'center', marginTop: 1 }}
              value={param?.store?.spec?.branch as string}
              type="String"
              variableName={branch}
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
            />
          )}
        </div>
      )}
      {param?.store?.spec?.gitFetchType === gitFetchTypes[1].value ||
        (template?.spec?.store?.spec?.gitFetchType === gitFetchTypes[1].value && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormInput.MultiTextInput
              label={getString('pipeline.manifestType.commitId')}
              placeholder={getString('pipeline.manifestType.commitPlaceholder')}
              name={commitId}
              multiTextInputProps={{ expressions, allowableTypes }}
            />
            {getMultiTypeFromValue(param?.store?.spec?.commitId) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                style={{ alignSelf: 'center', marginTop: 1 }}
                value={param?.store?.spec?.commitId as string}
                type="String"
                variableName={commitId}
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
              />
            )}
          </div>
        ))}
    </>
  )
}
