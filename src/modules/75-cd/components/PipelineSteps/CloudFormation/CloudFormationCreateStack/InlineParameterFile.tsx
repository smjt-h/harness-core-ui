/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Layout,
  Button,
  FormInput,
  Formik,
  MultiTypeInputType,
  getMultiTypeFromValue,
  FormikForm,
  ButtonVariation
} from '@harness/uicore'
import cx from 'classnames'

import { Classes, Dialog } from '@blueprintjs/core'

import { useStrings } from 'framework/strings'
import { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { TFMonaco } from '../../Common/Terraform/Editview/TFMonacoEditor'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface InlineParameterFileProps {
  arrayHelpers: any
  isEditMode: boolean
  selectedVarIndex: number
  showTfModal: boolean
  selectedVar: any
  onClose: () => void
  onSubmit: () => void
  isReadonly?: boolean
  allowableTypes: MultiTypeInputType[]
}

export const InlineParameterFile = (props: InlineParameterFileProps) => {
  const {
    arrayHelpers,
    isEditMode,
    selectedVarIndex,
    onSubmit,
    selectedVar,
    onClose,
    isReadonly = false,
    allowableTypes
  } = props

  const { getString } = useStrings()

  return (
    <Dialog
      isOpen={true}
      enforceFocus={false}
      title={'Add Inline CloudFormation Parameter'}
      isCloseButtonShown
      onClose={onClose}
      className={Classes.DIALOG}
    >
      <Layout.Vertical padding="medium">
        <Formik
          formName="inlineParameterFileForm"
          initialValues={selectedVar}
          onSubmit={(values: any) => {
            if (!isEditMode) {
              arrayHelpers && arrayHelpers.push(values)
            } else {
              arrayHelpers && arrayHelpers.replace(selectedVarIndex, values)
            }
            onSubmit()
          }}
          validationSchema={{}}
        >
          {formikProps => {
            const { values, setFieldValue } = formikProps
            return (
              <FormikForm>
                <div className={stepCss.formGroup}>
                  <FormInput.Text name="parameterFile.identifier" label={getString('identifier')} />
                </div>
                <div className={cx(stepCss.formGroup)}>
                  <MultiTypeFieldSelector
                    name="parameterFile.spec.content"
                    label={getString('pipelineSteps.content')}
                    defaultValueToReset=""
                    allowedTypes={allowableTypes}
                    formik={formikProps}
                    expressionRender={() => (
                      <TFMonaco
                        name="parameterFile.spec.content"
                        formik={formikProps}
                        title={getString('pipelineSteps.content')}
                      />
                    )}
                    skipRenderValueInExpressionLabel
                  >
                    <TFMonaco
                      name="parameterFile.spec.content"
                      formik={formikProps}
                      title={getString('pipelineSteps.content')}
                    />
                  </MultiTypeFieldSelector>
                  {getMultiTypeFromValue(values.varFile?.spec?.content) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ marginTop: 7 }}
                      value={values.varFile?.spec?.content as string}
                      type="String"
                      variableName="parameterFile.spec.content"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => setFieldValue('parameterFile.spec.content', value)}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>

                <Layout.Horizontal spacing={'medium'} margin={{ top: 'huge' }}>
                  <Button type="submit" variation={ButtonVariation.PRIMARY} data-testid="submit-inline-parameter">
                    {getString('submit')}
                  </Button>
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Dialog>
  )
}
