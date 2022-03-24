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
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../CloudFormation.module.scss'

interface CFFileStoreProps {
  isParam: boolean
  allowableTypes: MultiTypeInputType[]
  initialValues: any
  onSubmit: (values: any) => void
}

export const CFFileStore: React.FC<StepProps<any> & CFFileStoreProps> = ({
  previousStep,
  allowableTypes,
  isParam,
  initialValues,
  onSubmit
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
          parametersFile: Yup.object().shape({
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
    })
  }
  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.tfVarStore}>
      <Text font="large" color={Color.GREY_800}>
        {title}
      </Text>
      <Formik
        formName="cfFileStore"
        initialValues={FormatFilePaths(initialValues, isParam)}
        enableReinitialize
        validationSchema={isParam ? paramSchema : templateSchema}
        onSubmit={onSubmit}
      >
        {({ values }) => {
          let name: string
          let filePaths: { path: string }[] | undefined
          if (isParam) {
            name = 'spec.configuration.parameters.parametersFile.spec.store.spec.paths'
            filePaths = values?.spec?.configuration?.parameters?.parametersFile?.spec?.store?.spec?.paths
          } else {
            name = 'spec.configuration.templateFile.spec.store.spec.paths[0].path'
            filePaths = values?.spec?.configuration?.templateFile?.spec?.store?.spec?.paths
          }
          return (
            <Form>
              <div className={css.tfRemoteForm}>
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
                            {map(filePaths, (path: any, index: number) => (
                              <Layout.Horizontal
                                key={`${path}-${index}`}
                                flex={{ distribution: 'space-between' }}
                                style={{ alignItems: 'end' }}
                              >
                                <Layout.Horizontal
                                  spacing="medium"
                                  style={{ alignItems: 'baseline' }}
                                  className={css.formContainer}
                                  key={`${path}-${index}`}
                                  draggable={true}
                                  onDragEnd={onDragEnd}
                                  onDragOver={onDragOver}
                                  onDragLeave={onDragLeave}
                                  onDragStart={event => onDragStart(event, index)}
                                  onDrop={event => onDrop(event, arrayHelpers, index)}
                                >
                                  <Icon name="drag-handle-vertical" className={css.drag} />
                                  <Text width={12}>{`${index + 1}.`}</Text>
                                  <FormInput.MultiTextInput
                                    name={`${name}[${index}].path`}
                                    label=""
                                    multiTextInputProps={{
                                      expressions,
                                      allowableTypes: allowableTypes.filter(item => item !== MultiTypeInputType.RUNTIME)
                                    }}
                                    style={{ width: 320 }}
                                  />
                                  {isParam && (
                                    <Button
                                      minimal
                                      icon="main-trash"
                                      data-testid={`remove-header-${index}`}
                                      onClick={() => arrayHelpers.remove(index)}
                                    />
                                  )}
                                </Layout.Horizontal>
                              </Layout.Horizontal>
                            ))}
                            {isParam && (
                              <Button
                                icon="plus"
                                variation={ButtonVariation.LINK}
                                data-testid="add-header"
                                onClick={() => arrayHelpers.push({ path: '' })}
                              >
                                {getString('cd.addTFVarFileLabel')}
                              </Button>
                            )}
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
