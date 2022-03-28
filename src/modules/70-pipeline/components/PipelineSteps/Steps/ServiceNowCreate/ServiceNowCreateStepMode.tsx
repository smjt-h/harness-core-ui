/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import * as Yup from 'yup'
import { FieldArray, FormikProps } from 'formik'
import {
  Button,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  PageSpinner
} from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { String, StringKeys, useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  ServiceNowFieldNG,
  ServiceNowTicketTypeDTO,
  useGetServiceNowIssueCreateMetadata,
  useGetServiceNowTicketTypes
} from 'services/cd-ng'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import { useQueryParams } from '@common/hooks'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { ServiceNowTicketTypeSelectOption } from '../ServiceNowApproval/types'
import { getGenuineValue } from '../ServiceNowApproval/helper'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { ServiceNowDynamicFieldsSelector } from './ServiceNowDynamicFieldsSelector'
import type {
  ServiceNowCreateData,
  ServiceNowCreateFieldType,
  ServiceNowCreateFormContentInterface,
  ServiceNowCreateStepModeProps
} from './types'
import { getKVFieldsToBeAddedInForm, getSelectedFieldsToBeAddedInForm, processFormData, resetForm } from './helper'
import { ServiceNowFieldsRenderer } from './ServiceNowFieldsRenderer'
import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ServiceNowCreate.module.scss'
import { FieldType } from './types'
import { ConnectorRefSchema } from '@common/utils/Validation'
const fetchingTicketTypesPlaceholder: StringKeys = 'pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder'
function FormContent({
  formik,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType,
  refetchServiceNowTicketTypes,
  fetchingServiceNowTicketTypes,
  serviceNowTicketTypesResponse,
  serviceNowMetadataResponse,
  serviceNowTicketTypesFetchError,

  fetchingServiceNowMetadata
}: ServiceNowCreateFormContentInterface): JSX.Element {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [ticketFieldList, setTicketFieldList] = useState<ServiceNowFieldNG[]>([])
  const [count, setCount] = React.useState(0)
  const [serviceNowTicketTypesOptions, setServiceNowTicketTypesOptions] = useState<ServiceNowTicketTypeSelectOption[]>(
    []
  )
  const [connectorValueType, setConnectorValueType] = useState<MultiTypeInputType>(MultiTypeInputType.FIXED)
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)
  const ticketTypeKeyFixedValue =
    getMultiTypeFromValue(formik.values.spec.ticketType) === MultiTypeInputType.FIXED &&
    !isEmpty(formik.values.spec.ticketType)
      ? formik.values.spec.ticketType
      : undefined
  const serviceNowType = 'createMode'
  useEffect(() => {
    if (connectorRefFixedValue && connectorValueType === MultiTypeInputType.FIXED) {
      refetchServiceNowTicketTypes({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue])
  useEffect(() => {
    if (ticketTypeKeyFixedValue && serviceNowMetadataResponse?.data) {
      setTicketFieldList(serviceNowMetadataResponse?.data)
    }
  }, [serviceNowMetadataResponse?.data, ticketTypeKeyFixedValue])

  useEffect(() => {
    // Set ticket types
    let options: ServiceNowTicketTypeSelectOption[] = []
    const ticketTypesResponseList: ServiceNowTicketTypeDTO[] = serviceNowTicketTypesResponse?.data || []
    options = ticketTypesResponseList.map((ticketType: ServiceNowTicketTypeDTO) => ({
      label: defaultTo(ticketType.name, ''),
      value: defaultTo(ticketType.key, ''),
      key: defaultTo(ticketType.key, '')
    }))
    setServiceNowTicketTypesOptions(options)
  }, [serviceNowTicketTypesResponse?.data])

  const [showDynamicFieldsModal, hideDynamicFieldsModal] = useModalHook(() => {
    return (
      <Dialog
        className={css.addFieldsModal}
        enforceFocus={false}
        isOpen
        onClose={hideDynamicFieldsModal}
        title={getString('pipeline.serviceNowCreateStep.addFields')}
      >
        <ServiceNowDynamicFieldsSelector
          connectorRef={connectorRefFixedValue || ''}
          selectedTicketTypeKey={ticketTypeKeyFixedValue?.toString() || ''}
          serviceNowType={serviceNowType}
          selectedFields={formik.values.spec.selectedFields}
          addSelectedFields={(fieldsToBeAdded: ServiceNowFieldNG[]) => {
            formik.setFieldValue(
              'spec.selectedFields',
              getSelectedFieldsToBeAddedInForm(
                fieldsToBeAdded,
                formik.values.spec.selectedFields,
                formik.values.spec.fields
              )
            )
            hideDynamicFieldsModal()
          }}
          provideFieldList={(fields: ServiceNowCreateFieldType[]) => {
            formik.setFieldValue(
              'spec.fields',
              getKVFieldsToBeAddedInForm(fields, formik.values.spec.fields, formik.values.spec.selectedFields)
            )
            hideDynamicFieldsModal()
          }}
          onCancel={hideDynamicFieldsModal}
        />
      </Dialog>
    )
  }, [connectorRefFixedValue, formik.values.spec.selectedFields, formik.values.spec.fields])

  function AddFieldsButton(): React.ReactElement {
    return (
      <Text
        onClick={() => {
          if (!isApprovalStepFieldDisabled(readonly)) {
            showDynamicFieldsModal()
          }
        }}
        style={{
          cursor: isApprovalStepFieldDisabled(readonly) ? 'not-allowed' : 'pointer'
        }}
        tooltipProps={{ dataTooltipId: 'serviceNowCreateAddFields' }}
        intent="primary"
      >
        {getString('pipeline.jiraCreateStep.fieldSelectorAdd')}
      </Text>
    )
  }

  return (
    <React.Fragment>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.InputWithIdentifier
            inputLabel={getString('name')}
            isIdentifierEditable={isNewStep}
            inputGroupProps={{ disabled: isApprovalStepFieldDisabled(readonly) }}
          />
        </div>
      )}

      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeDurationProps={{
            expressions,
            enableConfigureOptions: false,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.timeout) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={defaultTo(formik.values.timeout, '')}
            type="String"
            variableName="timeout"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('timeout', value)}
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={stepCss.divider} />

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeConnectorField
          name="spec.connectorRef"
          label={getString('pipeline.serviceNowApprovalStep.connectorRef')}
          width={390}
          className={css.connector}
          connectorLabelClass={css.connectorLabel}
          placeholder={getString('select')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ expressions, allowableTypes }}
          type="ServiceNow"
          enableConfigureOptions={false}
          selected={formik?.values?.spec.connectorRef as string}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(value: any, _unused, multiType) => {
            // Clear dependent fields
            setConnectorValueType(multiType)
            if (value?.record?.identifier !== connectorRefFixedValue) {
              resetForm(formik, 'connectorRef')
              setCount(count + 1)
              if (multiType !== MultiTypeInputType.FIXED) {
                setServiceNowTicketTypesOptions([])
                setTicketFieldList([])
              }
            }
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            style={{ marginTop: 14 }}
            value={formik.values.spec.connectorRef as string}
            type="String"
            variableName="spec.connectorRef"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.connectorRef', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <React.Fragment key={count}>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.MultiTypeInput
            tooltipProps={{
              dataTooltipId: 'serviceNowApprovalTicketType'
            }}
            selectItems={
              fetchingServiceNowTicketTypes
                ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
                : serviceNowTicketTypesOptions
            }
            label={getString('pipeline.serviceNowApprovalStep.ticketType')}
            name="spec.ticketType"
            placeholder={
              fetchingServiceNowTicketTypes
                ? getString(fetchingTicketTypesPlaceholder)
                : serviceNowTicketTypesFetchError?.message
                ? serviceNowTicketTypesFetchError?.message
                : getString('select')
            }
            useValue
            disabled={isApprovalStepFieldDisabled(readonly, fetchingServiceNowTicketTypes)}
            multiTypeInputProps={{
              selectProps: {
                addClearBtn: true,
                items: fetchingServiceNowTicketTypes
                  ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
                  : serviceNowTicketTypesOptions
              },
              allowableTypes,
              expressions,
              onChange: (value: unknown, _valueType, type) => {
                // Clear dependent fields
                if (
                  type === MultiTypeInputType.FIXED &&
                  !isEmpty(value) &&
                  (value as ServiceNowTicketTypeSelectOption) !== ticketTypeKeyFixedValue
                ) {
                  resetForm(formik, 'ticketType')
                  setCount(count + 1)
                }
              }
            }}
          />
        </div>
        <div className={stepCss.noLookDivider} />
      </React.Fragment>

      <React.Fragment>
        <FormInput.RadioGroup
          disabled={isApprovalStepFieldDisabled(readonly)}
          radioGroup={{ inline: true }}
          name="spec.fieldType"
          items={[
            {
              label: getString('pipeline.serviceNowCreateStep.fieldType.configureFields'),
              value: FieldType.ConfigureFields
            },
            {
              label: getString('pipeline.serviceNowCreateStep.fieldType.createFromTemplate'),
              value: FieldType.CreateFromTemplate,
              disabled: true
            }
          ]}
        />
        {formik.values.spec.fieldType === FieldType.ConfigureFields && (
          <div>
            {fetchingServiceNowMetadata ? (
              <PageSpinner message={getString('pipeline.jiraCreateStep.fetchingFields')} className={css.fetching} />
            ) : (
              <>
                <ServiceNowFieldsRenderer
                  selectedFields={formik.values.spec.selectedFields}
                  readonly={readonly}
                  onDelete={(index, selectedField) => {
                    const selectedFieldsAfterRemoval = formik.values.spec.selectedFields?.filter(
                      (_unused, i) => i !== index
                    )
                    formik.setFieldValue('spec.selectedFields', selectedFieldsAfterRemoval)
                    const customFields = formik.values.spec.fields?.filter(field => field.name !== selectedField.name)
                    formik.setFieldValue('spec.fields', customFields)
                  }}
                />

                {!isEmpty(formik.values.spec.fields) ? (
                  <FieldArray
                    name="spec.fields"
                    render={({ remove }) => {
                      return (
                        <div>
                          <div className={css.headerRow}>
                            <String className={css.label} stringID="keyLabel" />
                            <String className={css.label} stringID="valueLabel" />
                          </div>
                          {formik.values.spec.fields?.map((_unused: ServiceNowCreateFieldType, i: number) => (
                            <div className={css.headerRow} key={i}>
                              <FormInput.Text
                                name={`spec.fields[${i}].name`}
                                disabled={isApprovalStepFieldDisabled(readonly)}
                                placeholder={getString('pipeline.keyPlaceholder')}
                              />
                              <FormInput.MultiTextInput
                                name={`spec.fields[${i}].value`}
                                label=""
                                placeholder={getString('common.valuePlaceholder')}
                                disabled={isApprovalStepFieldDisabled(readonly)}
                                multiTextInputProps={{
                                  allowableTypes: allowableTypes.filter(item => item !== MultiTypeInputType.RUNTIME),
                                  expressions
                                }}
                              />
                              <Button
                                minimal
                                icon="main-trash"
                                disabled={isApprovalStepFieldDisabled(readonly)}
                                data-testid={`remove-fieldList-${i}`}
                                onClick={() => remove(i)}
                              />
                            </div>
                          ))}
                        </div>
                      )
                    }}
                  />
                ) : null}
              </>
            )}

            <AddFieldsButton />
          </div>
        )}
        {formik.values.spec.fieldType === FieldType.CreateFromTemplate && <div>Create From Template</div>}
      </React.Fragment>
    </React.Fragment>
  )
}

function ServiceNowCreateStepMode(
  props: ServiceNowCreateStepModeProps,
  formikRef: StepFormikFowardRef<ServiceNowCreateData>
) {
  const { onUpdate, isNewStep, readonly, onChange, stepViewType, allowableTypes } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const {
    refetch: refetchServiceNowTicketTypes,
    data: serviceNowTicketTypesResponse,
    error: serviceNowTicketTypesFetchError,
    loading: fetchingServiceNowTicketTypes
  } = useGetServiceNowTicketTypes({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const {
    refetch: refetchServiceNowMetadata,
    data: serviceNowMetadataResponse,
    error: serviceNowMetadataFetchError,
    loading: fetchingServiceNowMetadata
  } = useGetServiceNowIssueCreateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  return (
    <Formik<ServiceNowCreateData>
      onSubmit={values => {
        onUpdate?.(processFormData(values))
      }}
      formName="serviceNowCreate"
      initialValues={props.initialValues}
      validate={data => {
        onChange?.(processFormData(data))
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: ConnectorRefSchema({
            requiredErrorMsg: getString('pipeline.serviceNowApprovalStep.validations.connectorRef')
          }),
          ticketType: Yup.string().required(getString('pipeline.serviceNowApprovalStep.validations.ticketType'))
        })
      })}
    >
      {(formik: FormikProps<ServiceNowCreateData>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              readonly={readonly}
              isNewStep={isNewStep}
              refetchServiceNowTicketTypes={refetchServiceNowTicketTypes}
              fetchingServiceNowTicketTypes={fetchingServiceNowTicketTypes}
              serviceNowTicketTypesResponse={serviceNowTicketTypesResponse}
              serviceNowTicketTypesFetchError={serviceNowTicketTypesFetchError}
              refetchServiceNowMetadata={refetchServiceNowMetadata}
              fetchingServiceNowMetadata={fetchingServiceNowMetadata}
              serviceNowMetadataResponse={serviceNowMetadataResponse}
              serviceNowMetadataFetchError={serviceNowMetadataFetchError}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

const ServiceNowCreateStepModeWithRef = React.forwardRef(ServiceNowCreateStepMode)
export default ServiceNowCreateStepModeWithRef
