/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
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
  MultiSelectOption,
  Text,
  MultiTypeInput,
  Button,
  Icon
} from '@harness/uicore'
import { map } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { IdentifierSchemaWithOutName, NameSchema } from '@common/utils/Validation'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useListAwsRegions } from 'services/portal'
import { Connectors } from '@connectors/constants'
import { TFMonaco } from '../../Common/Terraform/Editview/TFMonacoEditor'
import CFRemoteWizard from '../ConnectorStep/CFRemoteWizard'
import { InlineParameterFile } from './InlineParameterFile'
import { onDragStart, onDragEnd, onDragLeave, onDragOver, onDrop } from '../DragHelper'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../CloudFormation.module.scss'

interface CloudFormationCreateStackProps {
  allowableTypes: MultiTypeInputType[]
  isNewStep: boolean | undefined
  readonly: boolean | undefined
  initialValues: any
  onUpdate: (values: any) => void
  onChange: (values: any) => void
  stepViewType: StepViewType | undefined
}

export const CloudFormationCreateStack = (
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
  const [showParam, setShowParam] = useState(false)
  const [regions, setRegions] = useState<MultiSelectOption[]>([])
  const { data: regionData } = useListAwsRegions({
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

  // const onTemplateChange = (type: string) => {}

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
        window.console.log('onSubmit:', values)
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
            awsRegion: Yup.string().required(getString('cd.cloudFormation.errors.region')),
            stackName: Yup.string().required(getString('cd.cloudFormation.errors.stackName'))
          })
        })
      })}
    >
      {formik => {
        setFormikRef(formikRef, formik)
        const { values, setFieldValue } = formik
        const config = values?.spec?.configuration
        const templateFileType = config?.templateFile?.type
        const inlineTemplateFile = config?.templateFile?.spec?.content
        const remoteTemplateFile = config?.templateFile?.spec?.store?.spec?.paths?.[0]
        const remoteParameterFiles = config?.parameters?.parametersFile?.spec?.store?.spec?.paths
        const inlineParameters = config?.parameters?.inline
        return (
          <>
            <div className={cx(stepCss.formGroup, stepCss.md)}>
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
            <div className={cx(stepCss.formGroup, stepCss.md)}>
              <FormInput.MultiTextInput
                name="spec.provisionerIdentifier"
                label={getString('pipelineSteps.provisionerIdentifier')}
                multiTextInputProps={{ expressions, allowableTypes }}
                disabled={readonly}
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
                />
              )}
            </div>
            <div className={css.divider} />
            <Layout.Vertical>
              <Layout.Horizontal className={css.horizontalFlex}>
                <FormMultiTypeConnectorField
                  label={
                    <Text style={{ display: 'flex', alignItems: 'center' }} color={Color.GREY_900}>
                      {getString('pipelineSteps.awsConnectorLabel')}
                    </Text>
                  }
                  type={Connectors.AWS}
                  width={400}
                  name="spec.configuration.awsConnectorRef"
                  placeholder={getString('select')}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  style={{ marginBottom: 10 }}
                  multiTypeProps={{ expressions, allowableTypes }}
                  disabled={readonly}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
            <Layout.Vertical className={css.addMarginBottom}>
              <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                {getString('regionLabel')}
              </Label>
              <Layout.Horizontal>
                <MultiTypeInput
                  name="spec.configuration.awsRegion"
                  selectProps={{
                    addClearBtn: false,
                    items: regions
                  }}
                  disabled={readonly}
                  onChange={({ value }: any) => setFieldValue('spec.configuration.awsRegion', value)}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
            <Layout.Vertical>
              <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                {getString('cd.cloudFormation.templateFile')}
              </Label>
              <Layout.Horizontal>
                <FormInput.Select
                  className={css.capabilitiesInput}
                  name="spec.configuration.templateFile.type"
                  items={[
                    { label: 'Remote', value: 'Remote' },
                    { label: 'Inline', value: 'Inline' },
                    { label: 'S3 URL', value: 'S3' }
                  ]}
                  disabled={readonly}
                  onChange={({ value }) => {
                    if (value === 'remote') {
                      setShowParam(false)
                      setShowModal(true)
                    }
                  }}
                />
              </Layout.Horizontal>
              {remoteTemplateFile && (
                <div className={cx(css.configFile, css.addMarginBottom)}>
                  <div className={css.configField}>
                    <>
                      <Text font="normal" lineClamp={1} width={200}>
                        /{remoteTemplateFile}
                      </Text>
                      <Button
                        minimal
                        icon="Edit"
                        withoutBoxShadow
                        iconProps={{ size: 16 }}
                        onClick={() => {
                          setShowParam(false)
                          setShowModal(true)
                        }}
                        data-name="config-edit"
                        withoutCurrentColor={true}
                      />
                    </>
                  </div>
                </div>
              )}
              {templateFileType === 'inline' && (
                <div className={cx(stepCss.formGroup, stepCss.alignStart, css.addMarginTop, css.addMarginBottom)}>
                  <MultiTypeFieldSelector
                    name="spec.configuration.templateFile.spec.content"
                    label={
                      <Text style={{ color: 'rgb(11, 11, 13)' }}>{getString('cd.cloudFormation.templateFile')}</Text>
                    }
                    defaultValueToReset=""
                    allowedTypes={allowableTypes}
                    skipRenderValueInExpressionLabel
                    disabled={readonly}
                    expressionRender={() => (
                      <TFMonaco
                        name="spec.configuration.templateFile.spec.content"
                        formik={formik}
                        expressions={expressions}
                        title={getString('cd.cloudFormation.templateFile')}
                      />
                    )}
                  >
                    <TFMonaco
                      name="spec.configuration.templateFile.spec.content"
                      formik={formik}
                      expressions={expressions}
                      title={getString('cd.cloudFormation.templateFile')}
                    />
                  </MultiTypeFieldSelector>
                  {getMultiTypeFromValue(inlineTemplateFile) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={inlineTemplateFile}
                      type="String"
                      variableName="tags"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => setFieldValue('spec.configuration.templateFile.spec.content', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
              )}
            </Layout.Vertical>
            <div className={cx(stepCss.formGroup, stepCss.md)}>
              <FormInput.MultiTextInput
                name="spec.configuration.stackName"
                label={getString('cd.cloudFormation.stackName')}
                multiTextInputProps={{ expressions, allowableTypes }}
                disabled={readonly}
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
                    setFieldValue('values.spec.configuration.stackName', value)
                  }}
                  isReadonly={readonly}
                />
              )}
            </div>
            <div className={css.divider} />
            <Accordion className={stepCss.accordion}>
              <Accordion.Panel
                id="step-1"
                summary={getString('common.optionalConfig')}
                details={
                  <div className={css.optionalDetails}>
                    <Layout.Vertical>
                      <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                        {getString('cd.cloudFormation.parameterFiles')}
                      </Label>
                      {remoteParameterFiles ? (
                        <div className={cx(css.addMarginBottom)}>
                          {map(remoteParameterFiles, paramFile => (
                            <div className={cx(css.configFile)}>
                              <div className={css.configField}>
                                <Text font="normal" lineClamp={1} width={200}>
                                  /{paramFile}
                                </Text>
                                <Button
                                  minimal
                                  icon="Edit"
                                  withoutBoxShadow
                                  iconProps={{ size: 16 }}
                                  onClick={() => {
                                    setShowParam(true)
                                    setShowModal(true)
                                  }}
                                  data-name="config-edit"
                                  withoutCurrentColor={true}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={cx(css.configFile, css.addMarginBottom)}>
                          <div className={css.configField}>
                            <a
                              data-testid="remoteParamFiles"
                              className={css.configPlaceHolder}
                              data-name="config-edit"
                              onClick={() => {
                                setShowParam(true)
                                setShowModal(true)
                              }}
                            >
                              {getString('cd.cloudFormation.specifyParameterFiles')}
                            </a>
                          </div>
                        </div>
                      )}
                    </Layout.Vertical>
                    <Layout.Vertical>
                      <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                        {getString('cd.cloudFormation.inlineParameterFiles')}
                      </Label>
                      {inlineParameters?.length ? (
                        <FieldArray
                          name="spec.configuration.parameters.inline"
                          render={arrayHelpers =>
                            map(inlineParameters, ({ name, value }, index: number) => (
                              <Layout.Horizontal
                                spacing="medium"
                                style={{ alignItems: 'baseline' }}
                                key={`${name}-${value}-${index}`}
                                draggable={true}
                                onDragEnd={onDragEnd}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDragStart={event => onDragStart(event, index)}
                                onDrop={event => onDrop(event, arrayHelpers, index)}
                              >
                                <Icon name="drag-handle-vertical" className={css.drag} />
                                <Text font="normal" lineClamp={1} width={200}>
                                  {name} : {value}
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
                              </Layout.Horizontal>
                            ))
                          }
                        />
                      ) : (
                        <div className={cx(css.configFile, css.addMarginBottom)}>
                          <div className={css.configField}>
                            <a
                              data-testid="remoteParamFiles"
                              className={css.configPlaceHolder}
                              data-name="config-edit"
                              onClick={() => setInlineParams(true)}
                            >
                              {getString('cd.cloudFormation.specifyInlineParameterFiles')}
                            </a>
                          </div>
                        </div>
                      )}
                    </Layout.Vertical>
                    <div className={cx(stepCss.formGroup, stepCss.md)}>
                      <FormInput.MultiTextInput
                        name="spec.configuration.roleArn"
                        label="Role ARN"
                        multiTextInputProps={{ expressions, allowableTypes }}
                        disabled={readonly}
                      />
                      {getMultiTypeFromValue(values.spec?.stackName) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={values?.spec?.stackName}
                          type="String"
                          variableName="spec.configuration.roleArn"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue('values.spec.configuration.roleArn', value)
                          }}
                          isReadonly={readonly}
                        />
                      )}
                    </div>
                    <Layout.Vertical className={css.addMarginBottom}>
                      <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                        {getString('cd.cloudFormation.specifyCapabilities')}
                      </Label>
                      <Layout.Horizontal>
                        <MultiTypeInput
                          name="spec.configuration.awsCapabilities"
                          selectProps={{
                            addClearBtn: false,
                            items: []
                          }}
                          disabled={readonly}
                        />
                      </Layout.Horizontal>
                    </Layout.Vertical>
                    <div className={css.divider} />
                    <div className={cx(stepCss.formGroup, stepCss.alignStart, css.addMarginTop, css.addMarginBottom)}>
                      <MultiTypeFieldSelector
                        name="spec.configuration.spec.tags.spec.content"
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
                            name="tags"
                            formik={formik}
                            expressions={expressions}
                            title={getString('tagsLabel')}
                          />
                        )}
                      >
                        <TFMonaco
                          name="tags"
                          formik={formik}
                          expressions={expressions}
                          title={getString('tagsLabel')}
                        />
                      </MultiTypeFieldSelector>
                      {getMultiTypeFromValue(values.tags) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={values.tags}
                          type="String"
                          variableName="tags"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => setFieldValue('tags', value)}
                          isReadonly={readonly}
                        />
                      )}
                    </div>
                    <Layout.Vertical>
                      <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                        {getString('cd.cloudFormation.continueStatus')}
                      </Label>
                      <Layout.Horizontal>
                        <MultiTypeInput
                          name="spec.configuration.skipBasedOnStackStatuses"
                          selectProps={{
                            addClearBtn: false,
                            items: []
                          }}
                          disabled={readonly}
                        />
                      </Layout.Horizontal>
                    </Layout.Vertical>
                  </div>
                }
              />
            </Accordion>
            <CFRemoteWizard
              readonly={readonly}
              allowableTypes={allowableTypes}
              showModal={showModal}
              onClose={() => {
                setShowParam(false)
                setShowModal(false)
              }}
              isParam={showParam}
              initialValues={values}
              setFieldValue={setFieldValue}
            />
            <InlineParameterFile
              initialValues={inlineParameters}
              isOpen={showInlineParams}
              onClose={() => setInlineParams(false)}
              onSubmit={inlineValues => {
                setFieldValue('spec.configuration.parameters.inline', inlineValues?.parameters)
                setInlineParams(false)
              }}
            />
          </>
        )
      }}
    </Formik>
  )
}
