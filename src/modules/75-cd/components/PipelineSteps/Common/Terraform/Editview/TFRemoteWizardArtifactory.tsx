/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Formik, FormInput, Layout, StepProps, Text, Color } from '@harness/uicore'
import React from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import { FieldArray, Form } from 'formik'

import { useStrings } from 'framework/strings'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

import css from './TerraformVarfile.module.scss'

interface TFRemoteProps {
  onSubmitCallBack: (data: any) => void
  isEditMode: boolean
  isReadonly?: boolean
}

export const TFRemoteWizardArtifactory: React.FC<StepProps<any> & TFRemoteProps> = ({
  previousStep,
  onSubmitCallBack
}) => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.tfVarStore}>
      <Text font="large" color={Color.GREY_800}>
        {getString('cd.varFileDetails')}
      </Text>
      <Formik
        formName="tfRemoteArtifactoryWizardForm"
        initialValues={{
          identifier: '',
          repository: '',
          artifactNames: []
        }}
        onSubmit={values => {
          window.console.log(values)
          onSubmitCallBack(values)
        }}
        validationSchema={Yup.object().shape({})}
      >
        {({ values }) => {
          return (
            <Form>
              <div className={css.tfRemoteForm}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Text name="varFile.identifier" label={getString('identifier')} />
                </div>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Text name="repository" label="Repository" />
                </div>
                <Text className={css.textCss}>Artifact Name</Text>
                <FieldArray
                  name="artifactNames"
                  render={({ push, remove }) => (
                    <>
                      {values.artifactNames?.map((_, index) => (
                        <Layout.Horizontal key={index}>
                          <FormInput.Text
                            className={css.artifactName}
                            name={`artifactNames[${index}].key`}
                            placeholder="name"
                          />
                          <FormInput.DropDown
                            className={css.dropdown}
                            name={`${name}fieldType`}
                            items={[
                              { label: 'Latest', value: 'latest' },
                              { label: 'blah blah blah', value: 'blah blah blah' }
                            ]}
                            dropDownProps={{
                              isLabel: true,
                              filterable: false,
                              minWidth: 'unset'
                            }}
                          />
                          <Button icon="main-trash" iconProps={{ size: 20 }} minimal onClick={() => remove(index)} />
                        </Layout.Horizontal>
                      ))}
                      <Button
                        intent="primary"
                        minimal
                        text={getString('plusAdd')}
                        onClick={() => push({ name: '', version: '' })}
                      />
                    </>
                  )}
                />
              </div>

              <Layout.Horizontal spacing="xxlarge">
                <Button
                  text={getString('back')}
                  variation={ButtonVariation.SECONDARY}
                  icon="chevron-left"
                  onClick={() => previousStep?.()}
                  data-name="tf-remote-back-btn"
                />
                <Button
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('submit')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
