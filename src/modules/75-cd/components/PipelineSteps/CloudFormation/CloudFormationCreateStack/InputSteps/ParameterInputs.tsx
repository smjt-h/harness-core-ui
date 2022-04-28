/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { map, get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { FormikContext, FieldArray } from 'formik'
import {
  FormInput,
  Text,
  Color,
  Container,
  Layout,
  Icon,
  Button,
  ButtonVariation
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConnectorMap, ConnectorLabelMap, ConnectorTypes, isRuntime } from '../../CloudFormationHelper'
import type { CreateStackData, CreateStackProps } from '../../CloudFormationInterfaces'
import { onDragStart, onDragEnd, onDragLeave, onDragOver, onDrop } from '../../DragHelper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../../CloudFormation.module.scss'

export default function ParameterFileInputs<T extends CreateStackData = CreateStackData>(
  props: CreateStackProps<T> & { formik?: FormikContext<any> }
): React.ReactElement {
  const { inputSetData, readonly, path, allowableTypes, formik } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [isAccount, setIsAccount] = useState<boolean>(false)
  return (
    <>
      {inputSetData?.template?.spec?.configuration?.parameters && (
        <Container flex width={120} padding={{ bottom: 'small' }}>
          <Text font={{ weight: 'bold' }}>{getString('cd.cloudFormation.parameterFileDetails')}</Text>
        </Container>
      )}
      {map(inputSetData?.template?.spec?.configuration?.parameters, (param, i) => {
        const filePaths = get(formik?.values, `${path}.spec.configuration.parameters[${i}].store.spec.paths`) || []
        const newConnectorLabel = `${
          !!param?.store?.type && getString(ConnectorLabelMap[param?.store?.type as ConnectorTypes])
        } ${getString('connector')}`
        return (
          <>
            {isRuntime(param?.store?.spec?.connectorRef as string) && (
              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeConnectorField
                  label={<Text color={Color.GREY_900}>{newConnectorLabel}</Text>}
                  type={ConnectorMap[param?.store?.type]}
                  name={`${path}.spec.configuration.parameters[${i}].store.spec.connectorRef`}
                  placeholder={getString('select')}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  style={{ marginBottom: 10 }}
                  multiTypeProps={{ expressions, allowableTypes }}
                  disabled={readonly}
                  onChange={(value: any, _unused, _notUsed) => {
                    setIsAccount(value?.record?.spec?.type === 'Account')
                    formik?.setFieldValue(
                      `${path}.spec.configuration.parameters[${i}].store.spec.connectorRef`,
                      value?.record?.identifier
                    )
                  }}
                  setRefValue
                />
              </div>
            )}
            {isRuntime(param?.store?.spec?.region as string) && (
              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormInput.MultiTextInput
                  name={`${path}.spec.configuration.parameters[${i}].store.spec.commitId`}
                  label={getString('pipelineSteps.deploy.inputSet.branch')}
                  disabled={readonly}
                  multiTextInputProps={{
                    expressions,
                    allowableTypes
                  }}
                />
              </div>
            )}
            {/*
              *
              If a connector type of account is chosen 
              we need to get the repo name to access the files
              *
              */}
            {(isAccount || isRuntime(param?.store?.spec?.repoName as string)) && (
              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormInput.MultiTextInput
                  name={`${path}.spec.configuration.parameters[${i}].store.spec.repoName`}
                  label={getString('pipelineSteps.repoName')}
                  disabled={readonly}
                  multiTextInputProps={{
                    expressions,
                    allowableTypes
                  }}
                />
              </div>
            )}
            {isRuntime(param?.store?.spec?.branch as string) && (
              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormInput.MultiTextInput
                  name={`${path}.spec.configuration.parameters[${i}].store.spec.branch`}
                  label={getString('pipelineSteps.deploy.inputSet.branch')}
                  disabled={readonly}
                  multiTextInputProps={{
                    expressions,
                    allowableTypes
                  }}
                />
              </div>
            )}
            {isRuntime(param?.store?.spec?.commitId as string) && (
              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormInput.MultiTextInput
                  name={`${path}.spec.configuration.parameters[${i}].store.spec.commitId`}
                  label={getString('pipelineSteps.deploy.inputSet.branch')}
                  disabled={readonly}
                  multiTextInputProps={{
                    expressions,
                    allowableTypes
                  }}
                />
              </div>
            )}
            {isRuntime(param?.store?.spec?.paths as string) && (
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <Layout.Vertical>
                  <Container padding={{ bottom: 'small' }}>
                    <Text font={{ weight: 'bold' }}>{getString('filePaths')}</Text>
                  </Container>
                  <FieldArray
                    name={`${path}.spec.configuration.parameters[${i}].store.spec.paths`}
                    render={arrayHelpers => (
                      <>
                        {map(filePaths, (_: string, n: number) => (
                          <Layout.Horizontal
                            key={`filePath-${n}`}
                            flex={{ distribution: 'space-between' }}
                            style={{ alignItems: 'end' }}
                          >
                            <Layout.Horizontal
                              spacing="medium"
                              style={{ alignItems: 'baseline' }}
                              className={css.formContainer}
                              key={`filePath-${n}`}
                              draggable={true}
                              onDragEnd={onDragEnd}
                              onDragOver={onDragOver}
                              onDragLeave={onDragLeave}
                              onDragStart={event => onDragStart(event, n)}
                              onDrop={event => onDrop(event, arrayHelpers, n)}
                            >
                              <Icon name="drag-handle-vertical" className={css.drag} />
                              <Text width={12}>{`${n + 1}.`}</Text>
                              <FormInput.MultiTextInput
                                name={`${path}.spec.configuration.parameters[${i}].store.spec.paths[${n}]`}
                                label=""
                                multiTextInputProps={{
                                  expressions,
                                  allowableTypes
                                }}
                                style={{ width: 320 }}
                              />
                              <Button
                                minimal
                                icon="main-trash"
                                data-testid={`remove-header-${n}`}
                                onClick={() => arrayHelpers.remove(n)}
                              />
                            </Layout.Horizontal>
                          </Layout.Horizontal>
                        ))}
                        <Button
                          icon="plus"
                          variation={ButtonVariation.LINK}
                          data-testid="add-header"
                          onClick={() => arrayHelpers.push('')}
                        >
                          {getString('cd.addTFVarFileLabel')}
                        </Button>
                      </>
                    )}
                  />
                </Layout.Vertical>
              </div>
            )}
          </>
        )
      })}
    </>
  )
}
