/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { FieldArray, FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import {
  Button,
  Formik,
  FormInput,
  HarnessDocTooltip,
  MultiTypeInputType,
  PageSpinner,
  Radio,
  Select,
  Text
} from '@wings-software/uicore'
import { String, StringKeys, useStrings } from 'framework/strings'

import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import {
  ServiceNowFieldNG,
  ServiceNowTicketTypeDTO,
  useGetServiceNowIssueCreateMetadata,
  useGetServiceNowTicketTypes
} from 'services/cd-ng'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
// import { setTicketTypeOptions } from '../ServiceNowApproval/helper'
import type { ServiceNowTicketTypeSelectOption } from '../ServiceNowApproval/types'
import { ServiceNowFieldSelector } from './ServiceNowFieldSelector'
import {
  ServiceNowCreateFieldType,
  ServiceNowCreateFormFieldSelector,
  ServiceNowDynamicFieldsSelectorContentInterface,
  ServiceNowDynamicFieldsSelectorInterface
} from './types'
import css from './ServiceNowDynamicFieldsSelector.module.scss'
import { defaultTo } from 'lodash-es'
const fetchingTicketTypesPlaceholder: StringKeys = 'pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder'
function SelectFieldList(props: ServiceNowDynamicFieldsSelectorContentInterface) {
  const { getString } = useStrings()
  const {
    connectorRef,
    refetchServiceNowMetadata,

    fetchingServiceNowMetadata,

    serviceNowMetadataResponse,

    //showProjectDisclaimer,
    // serviceNowType,

    selectedTicketTypeKey: selectedTicketTypeKeyInit
  } = props

  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  }
  const { data: serviceNowTicketTypesResponse, loading: fetchingServiceNowTicketTypes } = useGetServiceNowTicketTypes({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })
  const [serviceNowTicketTypesOptions, setServiceNowTicketTypesOptions] = useState<ServiceNowTicketTypeSelectOption[]>(
    []
  )
  const [ticketTypeValue, setTicketTypeValue] = useState<ServiceNowTicketTypeSelectOption>(
    selectedTicketTypeKeyInit as ServiceNowTicketTypeSelectOption
  )
  const [fieldList, setFieldList] = useState<ServiceNowFieldNG[]>([])

  const selectedTicketTypeKey = ticketTypeValue?.toString()
 // const { fields } = props
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

  useEffect(() => {
    if (selectedTicketTypeKey && connectorRef) {
      refetchServiceNowMetadata({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRef.toString(),
          ticketType: selectedTicketTypeKey.toString()
        }
      })
    }
  })
  useEffect(() => {
    // If ticketType changes in form, set status and field list
    if (selectedTicketTypeKey) {
      const fieldListToSet: ServiceNowFieldNG[] = []
      const fieldKeys = Object.keys(serviceNowMetadataResponse?.data || {})
      fieldKeys.sort().forEach(keyy => {
        // if (ticketTypeData?.fields[keyy]) {
        //   if (serviceNowType === 'createMode' || serviceNowType === 'updateMode') {
        //     fieldListToSet.push(ticketTypeData?.fields[keyy])
        //   }
        // }
      })
      setFieldList(fieldListToSet)
    }
  }, [selectedTicketTypeKey])

  useEffect(() => {
    if (selectedTicketTypeKey && serviceNowMetadataResponse?.data) {
      setFieldList(serviceNowMetadataResponse?.data)
    }
  }, [serviceNowMetadataResponse?.data, selectedTicketTypeKey])

  return (
    <div>
      <Text className={css.selectFieldListHelp}>{getString('pipeline.serviceNowCreateStep.selectFieldListHelp')}</Text>

      <div className={css.select}>
        <Text className={css.selectLabel}>{getString('pipeline.serviceNowApprovalStep.ticketType')}</Text>
        <Select
          items={
            fetchingServiceNowTicketTypes
              ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
              : serviceNowTicketTypesOptions
          }
          inputProps={{
            placeholder: fetchingServiceNowMetadata
              ? getString('pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder')
              : getString('pipeline.serviceNowApprovalStep.issueTypePlaceholder')
          }}
          defaultSelectedItem={{
            label: selectedTicketTypeKey,
            value: selectedTicketTypeKey
          }}
          onChange={value => {
            setTicketTypeValue(value as ServiceNowTicketTypeSelectOption)
          }}
        />
      </div>

      {fetchingServiceNowMetadata ? (
        <PageSpinner
          message={getString('pipeline.jiraCreateStep.fetchingFields')}
          className={css.fetchingPageSpinner}
        />
      ) : null}

      {!selectedTicketTypeKey ? (
        <div className={css.fieldsSelectorPlaceholder}>
          <Text>{getString('pipeline.jiraCreateStep.fieldsSelectorPlaceholder')}</Text>
        </div>
      ) : (
        <div>
          {/*{showProjectDisclaimer ? (*/}
          {/*  <Text intent="warning">{getString('pipeline.jiraUpdateStep.projectIssueTypeDisclaimer')}</Text>*/}
          {/*) : null}*/}
          <ServiceNowFieldSelector
            fields={fieldList || []}
            selectedFields={props?.selectedFields || []}
            onCancel={props.onCancel}
            addSelectedFields={fields => props.addSelectedFields(fields, selectedTicketTypeKey)}
          />
        </div>
      )}
    </div>
  )
}

function ProvideFieldList(props: ServiceNowDynamicFieldsSelectorContentInterface) {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <Formik<ServiceNowCreateFieldType[]>
      onSubmit={values => {
        props.provideFieldList(values)
      }}
      formName="ServiceNowFields"
      initialValues={[]}
    >
      {(formik: FormikProps<{ fieldList: ServiceNowCreateFieldType[] }>) => {
        return (
          <div>
            <FieldArray
              name="fieldList"
              render={({ push, remove }) => {
                return (
                  <div>
                    {formik.values.fieldList?.length ? (
                      <div className={css.headerRow}>
                        <String className={css.label} stringID="keyLabel" />
                        <String className={css.label} stringID="valueLabel" />
                      </div>
                    ) : null}

                    {formik.values.fieldList?.map((_unused: ServiceNowCreateFieldType, i: number) => (
                      <div className={css.headerRow} key={i}>
                        <FormInput.Text
                          name={`fieldList[${i}].name`}
                          placeholder={getString('pipeline.keyPlaceholder')}
                        />
                        <FormInput.MultiTextInput
                          name={`fieldList[${i}].value`}
                          label=""
                          placeholder={getString('common.valuePlaceholder')}
                          multiTextInputProps={{
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                            expressions
                          }}
                        />
                        <Button
                          minimal
                          icon="main-trash"
                          data-testid={`remove-fieldList-${i}`}
                          onClick={() => remove(i)}
                        />
                      </div>
                    ))}
                    <Button
                      icon="plus"
                      minimal
                      intent="primary"
                      data-testid="add-fieldList"
                      onClick={() => push({ name: '', value: '' })}
                      className={css.addFieldsButton}
                    >
                      {getString('pipeline.serviceNowCreateStep.addFields')}
                    </Button>
                  </div>
                )
              }}
            />
            <div className={css.buttons}>
              <Button intent="primary" type="submit" onClick={() => props.provideFieldList(formik.values.fieldList)}>
                {getString('add')}
              </Button>
              <Button className={css.secondButton} onClick={props.onCancel}>
                {getString('cancel')}
              </Button>
            </div>
          </div>
        )
      }}
    </Formik>
  )
}

function Content(props: ServiceNowDynamicFieldsSelectorContentInterface) {
  const { getString } = useStrings()
  const { connectorRef } = props
  const [type, setType] = useState<ServiceNowCreateFormFieldSelector>(
    connectorRef ? ServiceNowCreateFormFieldSelector.FIXED : ServiceNowCreateFormFieldSelector.EXPRESSION
  )
  return (
    <div className={css.contentWrapper}>
      <div className={css.radioGroup}>
        <Radio
          onClick={() => setType(ServiceNowCreateFormFieldSelector.FIXED)}
          checked={type === ServiceNowCreateFormFieldSelector.FIXED}
          disabled={!connectorRef}
        >
          <span data-tooltip-id="ServiceNowSelectFromFieldList">
            {getString('pipeline.jiraCreateStep.selectFromFieldList')}{' '}
            <HarnessDocTooltip useStandAlone={true} tooltipId="ServiceNowSelectFromFieldList" />
          </span>
        </Radio>
        <Radio
          onClick={() => setType(ServiceNowCreateFormFieldSelector.EXPRESSION)}
          checked={type === ServiceNowCreateFormFieldSelector.EXPRESSION}
        >
          <span data-tooltip-id="ServiceNowProvideFromFieldList">
            {getString('pipeline.jiraCreateStep.provideFieldList')}{' '}
            <HarnessDocTooltip useStandAlone={true} tooltipId="ServiceNowProvideFromFieldList" />
          </span>
        </Radio>
      </div>
      {type === ServiceNowCreateFormFieldSelector.FIXED ? (
        <SelectFieldList {...props} />
      ) : (
        <ProvideFieldList {...props} />
      )}
    </div>
  )
}

export function ServiceNowDynamicFieldsSelector(props: ServiceNowDynamicFieldsSelectorInterface) {
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  }
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
    <Content
      {...props}
      refetchServiceNowMetadata={refetchServiceNowMetadata}
      serviceNowMetadataFetchError={serviceNowMetadataFetchError}
      fetchingServiceNowMetadata={fetchingServiceNowMetadata}
      serviceNowMetadataResponse={serviceNowMetadataResponse}
    />
  )
}
