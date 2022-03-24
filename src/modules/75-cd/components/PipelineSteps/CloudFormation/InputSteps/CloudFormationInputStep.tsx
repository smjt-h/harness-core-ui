/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'

import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormInput,
  FormikForm
  // Text,
  // Container,
  // Color,
  // Label
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { CreateStackData, CreateStackProps } from '../CloudFormationInterfaces'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function TerraformInputStep<T extends CreateStackData = CreateStackData>(
  props: CreateStackProps<T>
): React.ReactElement {
  const { inputSetData, readonly, path, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  // const onUpdateRef = (arg: any): void => {
  //   onUpdate?.(arg)
  // }
  // const onChangeRef = (arg: any): void => {
  //   onChange?.(arg)
  // }
  return (
    <FormikForm>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
            disabled={readonly}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.spec.provisionerIdentifier`}
            label={getString('pipelineSteps.provisionerIdentifier')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.awsRegion) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.spec.configuration.awsRegion`}
            label={getString('regionLabel')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.stackName) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.spec.configuration.stackName`}
            label={getString('cd.cloudFormation.stackName')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {/*
      <ConfigInputs {...props} onUpdate={onUpdateRef} onChange={onChangeRef} />
      {inputSetData?.template?.spec?.configuration?.template?.type?.length && (
        <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
          {getString('cd.cloudFormation.cfTemplateFile')}
        </Label>
      )}
      {inputSetData?.template?.spec?.configuration?.template?.type === StoreTypes.Inline ? (
        <Fragment key={`${path}.spec.configuration.spec.varFiles[${index}]`}>
          <Container flex width={120} padding={{ bottom: 'small' }}>
            <Text font={{ weight: 'bold' }}>{getString('cd.varFile')}:</Text>
            {varFile?.varFile?.identifier}
          </Container>

          {getMultiTypeFromValue(varFile?.varFile?.spec?.content) === MultiTypeInputType.RUNTIME && (
            <div className={cx(stepCss.formGroup, stepCss.md)}>
              <FormInput.MultiTextInput
                name={`${path}.spec.configuration.spec.varFiles[${index}].varFile.spec.content`}
                label={getString('pipelineSteps.content')}
                multiTextInputProps={{
                  expressions,
                  allowableTypes
                }}
              />
            </div>
          )}
        </Fragment>
      ) : inputSetData?.template?.spec?.configuration?.template?.type === StoreTypes.Remote ? (
        <TFRemoteSection remoteVar={varFile} index={index} {...props} onUpdate={onUpdateRef} onChange={onChangeRef} />
      ) : (
        <></>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.awsCapabilities) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.TextArea
            name={`${path}.spec.configuration.awsCapabilities`}
            label={getString('cd.cloudFormation.specifyCapabilities')}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.tags?.spec?.content) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.TextArea name={`${path}.spec.configuration.tags.spec.content`} label={getString('tagsLabel')} />
        </div>
      )}
        */}
    </FormikForm>
  )
}
