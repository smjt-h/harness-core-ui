/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, forwardRef } from 'react'
import cx from 'classnames'
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
  TextInput,
  Text,
  MultiTypeInput
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { TFMonaco } from '../../Common/Terraform/Editview/TFMonacoEditor'
import AWSConnectorStep from '../ConnectorStep/ConnectorStep'
import CFParamFileList from './CFParameterFileList'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../CloudFormation.module.scss'

const getVals = (): MultiSelectOption[] => [
  { label: 'US East (Ohio)', value: 'us-east-2' },
  { label: 'US East (N. Virginia)', value: 'us-east-1' }
]

export const CloudFormationCreateStack = ({
  allowableTypes,
  isNewStep,
  readonly = false,
  initialValues,
  onUpdate,
  onChange
}: any): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [showModal, setShowModal] = useState(false)
  const [, setShowCapabilities] = useState(false)
  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      formName="cloudFormationCreateStack"
      validate={values => {
        window.console.log('validate:', values)
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
    >
      {formik => {
        const { values, setFieldValue } = formik
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
                multiTypeDurationProps={{
                  enableConfigureOptions: false,
                  expressions,
                  allowableTypes
                }}
                disabled={readonly}
              />
            </div>
            <div className={css.divider} />
            <Layout.Vertical>
              <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                {getString('pipelineSteps.awsConnectorLabel')}
              </Label>
              <div className={cx(css.configFile, css.addMarginBottom)}>
                <div className={css.configField}>
                  <a data-testid="awsConnector" className={css.configPlaceHolder} onClick={() => setShowModal(true)}>
                    {getString('connectors.selectConnector')}
                  </a>
                </div>
              </div>
            </Layout.Vertical>
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
            <Layout.Vertical className={css.addMarginBottom}>
              <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                {getString('cd.cloudFormation.templateFile')}
              </Label>
              <Layout.Horizontal>
                <FormInput.Select
                  className={css.capabilitiesInput}
                  name="capabilities"
                  items={[
                    { label: 'Remote', value: 'remote' },
                    { label: 'Inline', value: 'inline' }
                  ]}
                  disabled={readonly}
                  onChange={({ value }) => (value === 'remote' ? setShowCapabilities(true) : null)}
                />
              </Layout.Horizontal>
              {values?.templateFile === 'inline' && (
                <div className={cx(stepCss.formGroup, stepCss.alignStart, css.addMarginTop, css.addMarginBottom)}>
                  <TFMonaco name="templateFile" formik={formik} expressions={expressions} title="" />
                </div>
              )}
            </Layout.Vertical>
            <Layout.Vertical className={css.addMarginBottom}>
              <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                {getString('regionLabel')}
              </Label>
              <Layout.Horizontal id="primary-borderless-buttons">
                <MultiTypeInput
                  name="region"
                  selectProps={{
                    addClearBtn: false,
                    items: getVals()
                  }}
                  disabled={readonly}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
            <div className={css.divider} />
            <Accordion className={stepCss.accordion}>
              <Accordion.Panel
                id="step-1"
                summary={getString('common.optionalConfig')}
                details={
                  <div className={css.optionalDetails}>
                    <div className={cx(stepCss.formGroup, stepCss.md)}>
                      <FormInput.MultiTextInput
                        name="spec.configuration.spec.workspace"
                        label={getString('cd.cloudFormation.stackName')}
                        multiTextInputProps={{ expressions, allowableTypes }}
                        disabled={readonly}
                      />
                      {getMultiTypeFromValue(values.spec?.stackName) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={values?.spec?.stackName}
                          type="String"
                          variableName="configuration.spec.workspace"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue('values.spec.configuration.spec.workspace', value)
                          }}
                          isReadonly={readonly}
                        />
                      )}
                    </div>
                    <div className={cx(stepCss.formGroup, stepCss.md)}>
                      <FormInput.MultiTextInput
                        name="spec.configuration.spec.workspace"
                        label={getString('connectors.awsKms.roleArnLabel')}
                        multiTextInputProps={{ expressions, allowableTypes }}
                        disabled={readonly}
                      />
                      {getMultiTypeFromValue(values.spec?.role) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={values.spec?.role}
                          type="String"
                          variableName="configuration.spec.workspace"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue('values.spec.configuration.spec.workspace', value)
                          }}
                          isReadonly={readonly}
                        />
                      )}
                    </div>
                    <Layout.Vertical>
                      <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                        {getString('cd.cloudFormation.specifyCapabilities')}
                      </Label>
                      <Layout.Horizontal id="primary-borderless-buttons">
                        <MultiTypeInput
                          name="capabilities"
                          selectProps={{
                            addClearBtn: false,
                            items: []
                          }}
                          disabled={readonly}
                        />
                      </Layout.Horizontal>
                    </Layout.Vertical>
                    <CFParamFileList formik={formik} allowableTypes={allowableTypes} />
                    <div className={css.divider} />
                    <div className={cx(stepCss.formGroup, stepCss.alignStart, css.addMarginTop, css.addMarginBottom)}>
                      <MultiTypeFieldSelector
                        name="spec.configuration.spec.backendConfig.spec.content"
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
                    <Layout.Horizontal>
                      <FormInput.CheckBox
                        name={`provisionerEnabled`}
                        disabled={readonly}
                        label="Wait for resources"
                        onChange={() => window.console.log('CheckBox')}
                      />
                      <TextInput name="waitForResources" type="number" width={5} />
                    </Layout.Horizontal>
                    <Layout.Vertical>
                      <Label style={{ color: Color.GREY_900 }} className={css.configLabel}>
                        Continue Based on Stack Statuses
                      </Label>
                      <Layout.Horizontal id="primary-borderless-buttons">
                        <MultiTypeInput
                          name="stackStatuses"
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
            <AWSConnectorStep
              readonly={readonly}
              allowableTypes={allowableTypes}
              showModal={showModal}
              setShowModal={setShowModal}
            />
          </>
        )
      }}
    </Formik>
  )
}

export const CloudFormationCreateStackWithRef = forwardRef(CloudFormationCreateStack)
