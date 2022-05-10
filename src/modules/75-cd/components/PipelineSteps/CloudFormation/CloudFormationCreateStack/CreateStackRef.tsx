/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import * as Yup from 'yup'
import { FieldArray } from 'formik'
import {
  Accordion,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Color,
  Layout,
  Label,
  Text,
  MultiSelectOption,
  SelectOption,
  Button,
  Icon,
  useToaster
} from '@harness/uicore'
import { map } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { IdentifierSchemaWithOutName, NameSchema, ConnectorRefSchema } from '@common/utils/Validation'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useListAwsRegions } from 'services/portal'
import { useCFCapabilitiesForAws, useCFStatesForAws, useGetIamRolesForAws } from 'services/cd-ng'
import { Connectors } from '@connectors/constants'
import { TFMonaco } from '../../Common/Terraform/Editview/TFMonacoEditor'
import CFRemoteWizard from './RemoteFilesForm/CFRemoteWizard'
import { InlineParameterFile } from './InlineParameterFile'
import type { Parameter, CloudFormationCreateStackProps } from '../CloudFormationInterfaces'
import { onDragStart, onDragEnd, onDragLeave, onDragOver, onDrop } from '../DragHelper'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../CloudFormation.module.scss'

enum TemplateTypes {
  Remote = 'Remote',
  S3URL = 'S3URL',
  Inline = 'Inline'
}

export const CreateStack = (
  {
    allowableTypes,
    isNewStep = true,
    readonly = false,
    initialValues,
    onUpdate,
    onChange
  }: CloudFormationCreateStackProps,
  formikRef: StepFormikFowardRef
): JSX.Element => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { expressions } = useVariablesExpression()
  const [showModal, setShowModal] = useState(false)
  const [showInlineParams, setInlineParams] = useState(false)
  const [paramIndex, setParamIndex] = useState<number | undefined>()
  const [regions, setRegions] = useState<MultiSelectOption[]>([])
  const [capabilities, setCapabilities] = useState<SelectOption[]>([])
  const [awsStates, setAwsStates] = useState<SelectOption[]>([])
  const [awsRoles, setAwsRoles] = useState<MultiSelectOption[]>([])
  const [awsRef, setAwsRef] = useState<string>('')
  const { showError } = useToaster()

  const {
    data: regionData,
    loading: regionLoading,
    error: regionError
  } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  useEffect(() => {
    if (regionData) {
      const regionValues = map(regionData?.resource, reg => ({ label: reg.name, value: reg.value }))
      setRegions(regionValues as MultiSelectOption[])
    }
  }, [regionData])

  const { data: capabilitiesData, loading: capabilitiesLoading, error: capabilitiesError } = useCFCapabilitiesForAws({})

  useEffect(() => {
    if (capabilitiesData) {
      const capabilitiesValues = map(capabilitiesData?.data, cap => ({ label: cap, value: cap }))
      setCapabilities(capabilitiesValues as SelectOption[])
    }
  }, [capabilitiesData])

  const { data: awsStatesData, loading: statesLoading, error: statesError } = useCFStatesForAws({})

  useEffect(() => {
    if (awsStatesData) {
      const awsStatesValues = map(awsStatesData?.data, cap => ({ label: cap, value: cap }))
      setAwsStates(awsStatesValues as SelectOption[])
    }
  }, [awsStatesData])

  const queryParams = useMemo(() => {
    return {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      awsConnectorRef: awsRef
    }
  }, [accountId, orgIdentifier, projectIdentifier, awsRef])

  const {
    data: roleData,
    refetch,
    loading: rolesLoading,
    error: rolesError
  } = useGetIamRolesForAws({
    lazy: true,
    debounce: 500,
    queryParams
  })

  useEffect(() => {
    if (regionError) {
      showError(regionError?.message)
    }
    if (capabilitiesError) {
      showError(capabilitiesError?.message)
    }
    if (statesError) {
      showError(statesError?.message)
    }
    if (rolesError) {
      showError(rolesError?.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionError, capabilitiesError, statesError, rolesError])

  useEffect(() => {
    if (roleData) {
      const roles = []
      for (const key in roleData?.data) {
        roles.push({ label: roleData?.data[key], value: key })
      }
      setAwsRoles(roles)
    }
    if (!roleData) {
      refetch()
    }
  }, [roleData, awsRef])

  const onSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: (field: string, value: any) => void
  ): void => {
    const fieldName = 'spec.configuration.templateFile'
    if (e.target.value === TemplateTypes.Inline) {
      setFieldValue(fieldName, {
        type: TemplateTypes.Inline,
        spec: {
          templateBody: ''
        }
      })
    } else if (e.target.value === TemplateTypes.Remote) {
      setFieldValue(fieldName, {
        type: TemplateTypes.Remote,
        spec: {
          store: {
            spec: {
              connectorRef: undefined
            }
          }
        }
      })
    } else {
      setFieldValue(fieldName, {
        type: TemplateTypes.S3URL,
        spec: {
          templateUrl: ''
        }
      })
    }
  }

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      formName="cloudFormationCreateStack"
      validate={values => {
        const payload = {
          ...values
        }
        onChange?.(payload)
      }}
      onSubmit={values => {
        const payload = {
          ...values
        }
        onUpdate?.(payload)
      }}
      validationSchema={Yup.object().shape({
        name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') }),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          provisionerIdentifier: Yup.lazy((value): Yup.Schema<unknown> => {
            if (getMultiTypeFromValue(value as string) === MultiTypeInputType.FIXED) {
              return IdentifierSchemaWithOutName(getString, {
                requiredErrorMsg: getString('common.validation.provisionerIdentifierIsRequired'),
                regexErrorMsg: getString('common.validation.provisionerIdentifierPatternIsNotValid')
              })
            }
            return Yup.string().required(getString('common.validation.provisionerIdentifierIsRequired'))
          }),
          configuration: Yup.object().shape({
            connectorRef: ConnectorRefSchema(),
            region: Yup.string().required(getString('cd.cloudFormation.errors.region')),
            stackName: Yup.string().required(getString('cd.cloudFormation.errors.stackName')),
            templateFile: Yup.object().shape({
              type: Yup.string(),
              spec: Yup.object()
                .when('type', {
                  is: value => value === TemplateTypes.Inline,
                  then: Yup.object().shape({
                    templateBody: Yup.string().required(getString('cd.cloudFormation.errors.templateBody'))
                  })
                })
                .when('type', {
                  is: value => value === TemplateTypes.S3URL,
                  then: Yup.object().shape({
                    templateUrl: Yup.string().required(getString('cd.cloudFormation.errors.awsURL'))
                  })
                })
                .when('type', {
                  is: value => value === TemplateTypes.Remote,
                  then: Yup.object().shape({
                    store: Yup.object({
                      spec: Yup.object().shape({
                        connectorRef: ConnectorRefSchema()
                      })
                    })
                  })
                })
            })
          })
        })
      })}
    >
      {formik => {
        setFormikRef(formikRef, formik)
        const { values, setFieldValue } = formik
        const awsConnector = values?.spec?.configuration?.connectorRef
        if (awsConnector !== awsRef) {
          setAwsRef(awsConnector)
        }
        const config = values?.spec?.configuration
        const templateFileType = config?.templateFile?.type
        const inlineTemplateFile = config?.templateFile?.spec?.templateBody
        const remoteTemplateFile = config?.templateFile?.spec?.store?.spec
        const templateUrl = config?.templateFile?.spec?.templateUrl
        const remoteParameterFiles = config?.parameters
        const inlineParameters = config?.parameters?.inline
        const awsRegion = config?.region
        const parameterOverrides = config?.parameterOverrides
        return (
          <>
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.InputWithIdentifier
                inputLabel={getString('name')}
                isIdentifierEditable={isNewStep}
                inputGroupProps={{
                  disabled: readonly
                }}
              />
            </div>
            <div className={cx(stepCss.formGroup, stepCss.sm)}>
              <FormMultiTypeDurationField
                name="timeout"
                label={getString('pipelineSteps.timeoutLabel')}
                multiTypeDurationProps={{ enableConfigureOptions: false, expressions, allowableTypes }}
                disabled={readonly}
              />
            </div>
            <div className={css.divider} />
            <div className={stepCss.formGroup}>
              <FormInput.MultiTextInput
                name="spec.provisionerIdentifier"
                label={getString('pipelineSteps.provisionerIdentifier')}
                multiTextInputProps={{ expressions, allowableTypes }}
                disabled={readonly}
                className={css.inputWidth}
              />
              {getMultiTypeFromValue(values.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  value={values.spec?.provisionerIdentifier as string}
                  type="String"
                  variableName="spec.provisionerIdentifier"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={value => {
                    setFieldValue('spec.provisionerIdentifier', value)
                  }}
                  isReadonly={readonly}
                  className={css.inputWidth}
                />
              )}
            </div>
            <div className={stepCss.formGroup}>
              <FormMultiTypeConnectorField
                label={<Text color={Color.GREY_900}>{getString('pipelineSteps.awsConnectorLabel')}</Text>}
                type={Connectors.AWS}
                name="spec.configuration.connectorRef"
                placeholder={getString('select')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                style={{ marginBottom: 10 }}
                multiTypeProps={{ expressions, allowableTypes }}
                disabled={readonly}
                width={300}
                setRefValue
              />
            </div>
            <Layout.Vertical className={css.addMarginBottom}>
              <Layout.Horizontal className={stepCss.formGroup}>
                <FormInput.MultiTypeInput
                  label={getString('regionLabel')}
                  name="spec.configuration.region"
                  disabled={readonly}
                  useValue
                  multiTypeInputProps={{
                    selectProps: {
                      allowCreatingNewItems: false,
                      items: regions
                    },
                    expressions,
                    allowableTypes,
                    width: 300
                  }}
                  selectItems={regions}
                  placeholder={regionLoading ? getString('loading') : getString('select')}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
            <div className={css.divider} />
            <Layout.Vertical>
              <Layout.Horizontal flex={{ alignItems: 'flex-start' }}>
                <Layout.Vertical>
                  <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                    {(templateFileType === TemplateTypes.Remote || templateFileType === TemplateTypes.S3URL) &&
                      getString('cd.cloudFormation.templateFile')}
                  </Label>
                </Layout.Vertical>
                <Layout.Vertical>
                  <select
                    className={css.templateDropdown}
                    name="spec.configuration.templateFile.type"
                    disabled={readonly}
                    value={templateFileType}
                    onChange={e => onSelectChange(e, setFieldValue)}
                  >
                    <option value={TemplateTypes.Remote}>{getString('remote')}</option>
                    <option value={TemplateTypes.Inline}>{getString('inline')}</option>
                    <option value={TemplateTypes.S3URL}>{getString('cd.cloudFormation.awsURL')}</option>
                  </select>
                </Layout.Vertical>
              </Layout.Horizontal>
              {templateFileType === TemplateTypes.Remote && (
                <div
                  className={cx(css.configFile, css.configField, css.addMarginBottom)}
                  onClick={() => {
                    setShowModal(true)
                  }}
                >
                  <>
                    <a className={css.configPlaceHolder}>
                      {getMultiTypeFromValue(remoteTemplateFile?.paths) === MultiTypeInputType.RUNTIME
                        ? `/${remoteTemplateFile?.paths}`
                        : remoteTemplateFile?.paths?.[0]
                        ? remoteTemplateFile?.paths?.[0]
                        : getString('cd.cloudFormation.specifyTemplateFile')}
                    </a>
                    <Button
                      minimal
                      icon="Edit"
                      withoutBoxShadow
                      iconProps={{ size: 16 }}
                      data-name="config-edit"
                      withoutCurrentColor={true}
                    />
                  </>
                </div>
              )}
              {templateFileType === TemplateTypes.Inline && (
                <div className={cx(stepCss.formGroup, stepCss.alignStart, css.addMarginTop, css.addMarginBottom)}>
                  <MultiTypeFieldSelector
                    name="spec.configuration.templateFile.spec.templateBody"
                    label={
                      <Text style={{ color: 'rgb(11, 11, 13)' }}>{getString('cd.cloudFormation.templateFile')}</Text>
                    }
                    defaultValueToReset=""
                    allowedTypes={allowableTypes}
                    skipRenderValueInExpressionLabel
                    disabled={readonly}
                    expressionRender={() => (
                      <TFMonaco
                        name="spec.configuration.templateFile.spec.templateBody"
                        formik={formik}
                        expressions={expressions}
                        title={getString('cd.cloudFormation.templateFile')}
                      />
                    )}
                  >
                    <TFMonaco
                      name="spec.configuration.templateFile.spec.templateBody"
                      formik={formik}
                      expressions={expressions}
                      title={getString('cd.cloudFormation.templateFile')}
                    />
                  </MultiTypeFieldSelector>
                  {getMultiTypeFromValue(inlineTemplateFile) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={inlineTemplateFile}
                      type="String"
                      variableName="spec.configuration.templateFile.spec.templateBody"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => setFieldValue('spec.configuration.templateFile.spec.templateBody', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
              )}
              {templateFileType === TemplateTypes.S3URL && (
                <div className={stepCss.formGroup}>
                  <FormInput.Text
                    name={'spec.configuration.templateFile.spec.templateUrl'}
                    label={''}
                    placeholder="http://www.test.com"
                  />
                </div>
              )}
            </Layout.Vertical>
            <div className={cx(stepCss.formGroup, stepCss.md)}>
              <FormInput.MultiTextInput
                name="spec.configuration.stackName"
                label={getString('cd.cloudFormation.stackName')}
                multiTextInputProps={{ expressions, allowableTypes }}
                disabled={readonly}
                className={css.inputWidth}
              />
              {getMultiTypeFromValue(values.spec?.stackName) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  value={values?.spec?.stackName}
                  type="String"
                  variableName="spec.configuration.stackName"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={value => {
                    setFieldValue('spec.configuration.stackName', value)
                  }}
                  isReadonly={readonly}
                  className={css.inputWidth}
                />
              )}
            </div>
            <Accordion className={stepCss.accordion}>
              <Accordion.Panel
                id="step-1"
                summary={getString('common.optionalConfig')}
                details={
                  <div className={css.optionalDetails}>
                    <Layout.Vertical>
                      <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                        {getString('optionalField', { name: getString('cd.cloudFormation.parameterFiles') })}
                      </Label>
                      {remoteParameterFiles && (
                        <FieldArray
                          name={'spec.configuration.parameters'}
                          render={arrayHelpers => (
                            <>
                              {map(remoteParameterFiles, (param: Parameter, index: number) => (
                                <Layout.Horizontal
                                  key={`${param}-${index}`}
                                  flex={{ distribution: 'space-between' }}
                                  style={{ alignItems: 'end' }}
                                >
                                  <Layout.Horizontal
                                    spacing="medium"
                                    style={{ alignItems: 'baseline' }}
                                    className={css.formContainer}
                                    key={`${param}-${index}`}
                                    draggable={true}
                                    onDragEnd={onDragEnd}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDragStart={event => onDragStart(event, index)}
                                    onDrop={event => onDrop(event, arrayHelpers, index)}
                                  >
                                    <Icon name="drag-handle-vertical" className={css.drag} />
                                    <Text width={12}>{`${index + 1}.`}</Text>
                                    <div className={css.configField}>
                                      <Text font="normal" lineClamp={1} width={200}>
                                        {param?.identifier}
                                      </Text>
                                      <Button
                                        minimal
                                        icon="Edit"
                                        withoutBoxShadow
                                        iconProps={{ size: 16 }}
                                        onClick={() => {
                                          setParamIndex(index)
                                          setShowModal(true)
                                        }}
                                        data-name="config-edit"
                                        withoutCurrentColor={true}
                                      />
                                    </div>
                                    <Button
                                      minimal
                                      icon="main-trash"
                                      data-testid={`remove-header-${index}`}
                                      onClick={() => arrayHelpers.remove(index)}
                                    />
                                  </Layout.Horizontal>
                                </Layout.Horizontal>
                              ))}
                            </>
                          )}
                        />
                      )}
                      <Layout.Horizontal className={cx(css.configFile, css.addMarginBottom, stepCss.topPadding3)}>
                        <a
                          data-testid="remoteParamFiles"
                          className={css.configPlaceHolder}
                          data-name="config-edit"
                          onClick={() => {
                            setParamIndex(remoteParameterFiles.length)
                            setShowModal(true)
                          }}
                        >
                          + {getString('add')}
                        </a>
                      </Layout.Horizontal>
                    </Layout.Vertical>
                    <Layout.Vertical className={css.addMarginBottom}>
                      <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                        {getString('optionalField', { name: getString('cd.cloudFormation.inlineParameterFiles') })}
                      </Label>
                      {inlineParameters?.length ? (
                        <div className={css.configField}>
                          <Text font="normal" lineClamp={1}>
                            {JSON.stringify(inlineParameters)}
                          </Text>
                          <Button
                            minimal
                            icon="Edit"
                            withoutBoxShadow
                            iconProps={{ size: 16 }}
                            onClick={() => setInlineParams(true)}
                            data-name="config-edit"
                            withoutCurrentColor={true}
                          />
                        </div>
                      ) : (
                        <div className={cx(css.configFile, css.addMarginBottom)}>
                          <div className={css.configField}>
                            <a
                              data-testid="remoteParamFiles"
                              className={cx(css.configPlaceHolder, css.truncate)}
                              data-name="config-edit"
                              onClick={() => setInlineParams(true)}
                            >
                              {parameterOverrides?.length > 0
                                ? `${JSON.stringify(parameterOverrides)}`
                                : getString('cd.cloudFormation.specifyInlineParameterFiles')}
                            </a>
                          </div>
                        </div>
                      )}
                    </Layout.Vertical>
                    <Layout.Vertical>
                      <FormInput.MultiTypeInput
                        label={getString('optionalField', { name: getString('connectors.awsKms.roleArnLabel') })}
                        name="spec.configuration.roleArn"
                        placeholder={getString(rolesLoading ? 'common.loading' : 'select')}
                        disabled={readonly}
                        useValue
                        multiTypeInputProps={{
                          selectProps: {
                            addClearBtn: true,
                            allowCreatingNewItems: false,
                            items: awsRoles
                          },
                          expressions,
                          allowableTypes,
                          width: 300
                        }}
                        selectItems={awsRoles}
                      />
                    </Layout.Vertical>
                    <FormInput.MultiSelectTypeInput
                      label={getString('optionalField', { name: getString('cd.cloudFormation.specifyCapabilities') })}
                      name="spec.configuration.capabilities"
                      selectItems={capabilities}
                      placeholder={capabilitiesLoading ? getString('loading') : ''}
                      multiSelectTypeInputProps={{
                        allowableTypes: allowableTypes.filter(item => item !== MultiTypeInputType.EXPRESSION),
                        multiSelectProps: {
                          items: capabilities,
                          allowCreatingNewItems: false
                        }
                      }}
                      disabled={readonly}
                    />
                    <div className={css.divider} />
                    <div className={cx(stepCss.formGroup, stepCss.alignStart, css.addMarginTop, css.addMarginBottom)}>
                      <MultiTypeFieldSelector
                        name="spec.configuration.tags.spec.content"
                        label={
                          <Text style={{ color: 'rgb(11, 11, 13)' }}>
                            {getString('optionalField', { name: getString('tagsLabel') })}
                          </Text>
                        }
                        defaultValueToReset=""
                        allowedTypes={allowableTypes}
                        skipRenderValueInExpressionLabel
                        disabled={readonly}
                        expressionRender={() => (
                          <TFMonaco
                            name="spec.configuration.tags.spec.content"
                            formik={formik}
                            expressions={expressions}
                            title={getString('tagsLabel')}
                          />
                        )}
                      >
                        <TFMonaco
                          name="spec.configuration.tags.spec.content"
                          formik={formik}
                          expressions={expressions}
                          title={getString('tagsLabel')}
                        />
                      </MultiTypeFieldSelector>
                      {getMultiTypeFromValue(values.tags) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={values.spec?.configuration?.spec?.tags?.spec?.content}
                          type="String"
                          variableName="spec.configuration.tags.spec.content"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => setFieldValue('spec.configuration.tags.spec.content', value)}
                          isReadonly={readonly}
                        />
                      )}
                    </div>
                    <FormInput.MultiSelectTypeInput
                      label={getString('optionalField', { name: getString('cd.cloudFormation.continueStatus') })}
                      name="spec.configuration.skipOnStackStatuses"
                      selectItems={awsStates}
                      placeholder={statesLoading ? getString('loading') : ''}
                      multiSelectTypeInputProps={{
                        allowableTypes: allowableTypes.filter(item => item !== MultiTypeInputType.EXPRESSION),
                        multiSelectProps: {
                          items: awsStates,
                          allowCreatingNewItems: false
                        }
                      }}
                      disabled={readonly}
                    />
                  </div>
                }
              />
            </Accordion>
            <CFRemoteWizard
              readonly={readonly}
              allowableTypes={allowableTypes}
              showModal={showModal}
              onClose={() => {
                setParamIndex(undefined)
                setShowModal(false)
              }}
              initialValues={values}
              setFieldValue={setFieldValue}
              index={paramIndex}
              regions={regions}
            />
            <InlineParameterFile
              initialValues={parameterOverrides}
              isOpen={showInlineParams}
              onClose={() => setInlineParams(false)}
              onSubmit={inlineValues => {
                setFieldValue('spec.configuration.parameterOverrides', inlineValues?.parameterOverrides)
                setInlineParams(false)
              }}
              awsConnectorRef={awsConnector}
              type={templateFileType}
              region={awsRegion}
              body={inlineTemplateFile || templateUrl}
              git={
                templateFileType === TemplateTypes.Remote
                  ? {
                      gitConnectorRef: remoteTemplateFile?.connectorRef?.value || remoteTemplateFile?.connectorRef,
                      isBranch: remoteTemplateFile?.gitFetchType === 'Branch',
                      filePath: remoteTemplateFile?.paths?.[0],
                      branch: remoteTemplateFile?.branch,
                      commitId: remoteTemplateFile?.commitId
                    }
                  : undefined
              }
            />
          </>
        )
      }}
    </Formik>
  )
}
