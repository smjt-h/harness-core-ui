/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import { map } from 'lodash-es'
import { FieldArray, Form } from 'formik'
import {
  Button,
  ButtonVariation,
  Layout,
  Text,
  Color,
  StepProps,
  Formik,
  MultiTypeInputType,
  getMultiTypeFromValue,
  FormInput,
  Icon
} from '@harness/uicore'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import { FormatFilePaths } from '../CloudFormationHelper'
import { onDragStart, onDragEnd, onDragLeave, onDragOver, onDrop } from '../DragHelper'
import { ParameterRepoDetails } from './ParameterRepoDetails'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../CloudFormation.module.scss'

interface CFFileStoreProps {
  isParam: boolean
  allowableTypes: MultiTypeInputType[]
  initialValues: any
  onSubmit: (values: any, connector: any) => void
  index: number
}

export const CFFileStore: React.FC<StepProps<any> & CFFileStoreProps> = ({
  previousStep,
  prevStepData,
  allowableTypes,
  isParam,
  initialValues,
  onSubmit,
  index
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const title = getString(isParam ? 'filePaths' : 'common.git.filePath')
  const pathSchema = Yup.lazy((value): Yup.Schema<unknown> => {
    if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
      return Yup.array().of(
        Yup.object().shape({
          path: Yup.string().min(1).required(getString('cd.pathCannotBeEmpty'))
        })
      )
    }
    return Yup.string().required(getString('cd.pathCannotBeEmpty'))
  })
  const templateSchema = {
    spec: Yup.object().shape({
      configuration: Yup.object().shape({
        templateFile: Yup.object().shape({
          spec: Yup.object().shape({
            store: Yup.object().shape({
              spec: Yup.object().shape({
                paths: pathSchema
              })
            })
          })
        })
      })
    })
  }
  const paramSchema = {
    spec: Yup.object().shape({
      configuration: Yup.object().shape({
        parameters: Yup.object().shape({
          identifier: Yup.string().min(1).required(getString('cd.pathCannotBeEmpty')),
          store: Yup.object().shape({
            spec: Yup.object().shape({
              paths: pathSchema
            })
          })
        })
      })
    })
  }
  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.tfVarStore}>
      <Text font="large" color={Color.GREY_800}>
        {title}
      </Text>
      <Formik
        formName="cfFileStore"
        initialValues={FormatFilePaths(initialValues, isParam, index)}
        enableReinitialize
        validationSchema={isParam ? paramSchema : templateSchema}
        onSubmit={data => {
          let connector = prevStepData?.spec?.configuration?.templateFile?.spec?.store?.spec?.connectorRef
          if (isParam) {
            connector = prevStepData?.spec?.configuration?.parameters[index]?.store?.spec?.connectorRef
          }
          onSubmit(data, connector)
        }}
      >
        {({ values }) => {
          let name = 'spec.configuration.templateFile.spec.store.spec.paths[0].path'
          let filePaths = values?.spec?.configuration?.templateFile?.spec?.store?.spec?.paths
          let connector = prevStepData?.spec?.configuration?.templateFile?.spec?.store?.spec?.connectorRef
          if (isParam) {
            name = `spec.configuration.parameters.store.spec.paths`
            filePaths = values?.spec?.configuration?.parameters?.store?.spec?.paths
            connector = prevStepData?.spec?.configuration?.parameters[index]?.store?.spec?.connectorRef
          }

          return (
            <Form>
              <div className={css.tfRemoteForm}>
                {connector?.connector?.type !== 'Aws' && (
                  <ParameterRepoDetails
                    isParam={isParam}
                    allowableTypes={allowableTypes}
                    index={index}
                    values={{ ...values, connector }}
                  />
                )}
                <div className={cx(stepCss.md)}>
                  <MultiTypeFieldSelector
                    name={name}
                    style={{ width: 370 }}
                    allowedTypes={allowableTypes.filter(item => item !== MultiTypeInputType.EXPRESSION)}
                    label={<Text flex={{ inline: true }}>{title}</Text>}
                  >
                    {!isParam ? (
                      <FormInput.MultiTextInput
                        name={name}
                        label=""
                        multiTextInputProps={{
                          expressions,
                          allowableTypes: allowableTypes.filter(item => item !== MultiTypeInputType.RUNTIME)
                        }}
                      />
                    ) : (
                      <FieldArray
                        name={name}
                        render={arrayHelpers => (
                          <>
                            {map(filePaths, (path: any, i: number) => (
                              <Layout.Horizontal
                                key={`${path}-${i}`}
                                flex={{ distribution: 'space-between' }}
                                style={{ alignItems: 'end' }}
                              >
                                <Layout.Horizontal
                                  spacing="medium"
                                  style={{ alignItems: 'baseline' }}
                                  className={css.formContainer}
                                  key={`${path}-${i}`}
                                  draggable={true}
                                  onDragEnd={onDragEnd}
                                  onDragOver={onDragOver}
                                  onDragLeave={onDragLeave}
                                  onDragStart={event => onDragStart(event, i)}
                                  onDrop={event => onDrop(event, arrayHelpers, i)}
                                >
                                  <Icon name="drag-handle-vertical" className={css.drag} />
                                  <Text width={12}>{`${i + 1}.`}</Text>
                                  <FormInput.MultiTextInput
                                    name={`${name}[${i}].path`}
                                    label=""
                                    multiTextInputProps={{
                                      expressions,
                                      allowableTypes: allowableTypes.filter(item => item !== MultiTypeInputType.RUNTIME)
                                    }}
                                    style={{ width: 320 }}
                                  />
                                  <Button
                                    minimal
                                    icon="main-trash"
                                    data-testid={`remove-header-${i}`}
                                    onClick={() => arrayHelpers.remove(i)}
                                  />
                                </Layout.Horizontal>
                              </Layout.Horizontal>
                            ))}
                            <Button
                              icon="plus"
                              variation={ButtonVariation.LINK}
                              data-testid="add-header"
                              onClick={() => arrayHelpers.push({ path: '' })}
                            >
                              {getString('cd.addTFVarFileLabel')}
                            </Button>
                          </>
                        )}
                      />
                    )}
                  </MultiTypeFieldSelector>
                </div>
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
