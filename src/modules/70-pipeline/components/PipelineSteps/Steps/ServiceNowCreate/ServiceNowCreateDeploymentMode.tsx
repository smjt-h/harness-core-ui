/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType, PageSpinner } from '@wings-software/uicore'
import { StringKeys, useStrings } from 'framework/strings'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import { getGenuineValue } from '../ServiceNowApproval/helper'

import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'

import { ServiceNowFieldsRenderer } from './ServiceNowFieldsRenderer'
import css from './ServiceNowCreate.module.scss'
import { useGetServiceNowIssueCreateMetadata, useGetServiceNowTicketTypes } from '../../../../../../services/cd-ng'
import type {
  ServiceNowCreateDeploymentModeFormContentInterface, ServiceNowCreateDeploymentModeProps,
  ServiceNowFieldNGWithValue
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/types'

import type { ServiceNowTicketTypeSelectOption } from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/types'
const fetchingTicketTypesPlaceholder: StringKeys = 'pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder'
function FormContent(formContentProps: ServiceNowCreateDeploymentModeFormContentInterface) {
  const {
    inputSetData,
    allowableTypes,
    initialValues,
    refetchServiceNowTicketTypes,
    refetchServiceNowMetadata,
    fetchingServiceNowTicketTypes,
    fetchingServiceNowMetadata,
    serviceNowTicketTypesFetchError
  } = formContentProps
  const template = inputSetData?.template
  const path = inputSetData?.path
  const prefix = isEmpty(path) ? '' : `${path}.`
  const readonly = inputSetData?.readonly
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()
  const { expressions } = useVariablesExpression()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const [serviceNowTicketTypesOptions] = React.useState<ServiceNowTicketTypeSelectOption[]>([])
  const [selectedField] = useState<ServiceNowFieldNGWithValue[]>([])

  const connectorRefFixedValue = getGenuineValue(
    initialValues.spec?.connectorRef || (inputSetData?.allValues?.spec?.connectorRef as string)
  )
  const ticketTypeFixedValue = initialValues.spec?.ticketType || inputSetData?.allValues?.spec?.ticketType

  useEffect(() => {
    if (connectorRefFixedValue) {
      refetchServiceNowTicketTypes({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue])

  useEffect(() => {
    // If project value changes in form, fetch metadata
    if (connectorRefFixedValue && ticketTypeFixedValue) {
      refetchServiceNowMetadata({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString(),
          ticketType: ticketTypeFixedValue.toString()
        }
      })
    }
  }, [serviceNowTicketTypesOptions, ticketTypeFixedValue])

  return (
    <React.Fragment>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <FormMultiTypeDurationField
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
          label={getString('pipelineSteps.timeoutLabel')}
          className={css.deploymentViewMedium}
          multiTypeDurationProps={{
            enableConfigureOptions: false,
            allowableTypes,
            expressions,
            disabled: isApprovalStepFieldDisabled(readonly)
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME ? (
        <FormMultiTypeConnectorField
          name={`${prefix}spec.connectorRef`}
          label={getString('pipeline.jiraApprovalStep.connectorRef')}
          selected={(initialValues?.spec?.connectorRef as string) || ''}
          placeholder={getString('pipeline.jiraApprovalStep.jiraConnectorPlaceholder')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={385}
          setRefValue
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeProps={{
            allowableTypes,
            expressions
          }}
          type={'ServiceNow'}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.ticketType) === MultiTypeInputType.RUNTIME ? (
        <FormInput.MultiTypeInput
          tooltipProps={{
            dataTooltipId: 'serviceNowApprovalTicketType'
          }}
          selectItems={
            fetchingServiceNowTicketTypes
              ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
              : serviceNowTicketTypesOptions
          }
          name={`${prefix}spec.ticketType`}
          label={getString('pipeline.serviceNowApprovalStep.ticketType')}
          className={css.deploymentViewMedium}
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
            allowableTypes
          }}
        />
      ) : null}

      {fetchingServiceNowMetadata ? (
        <PageSpinner message={getString('pipeline.jiraCreateStep.fetchingFields')} className={css.fetching} />
      ) : (
        <ServiceNowFieldsRenderer
          serviceNowContextType={'ServiceNowCreateDeploymentMode'}
          selectedFields={selectedField}
          readonly={readonly}
        />
      )}
    </React.Fragment>
  )
}

export default function ServiceNowCreateDeploymentMode(props: ServiceNowCreateDeploymentModeProps): JSX.Element {
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
    <FormContent
      {...props}
      refetchServiceNowTicketTypes={refetchServiceNowTicketTypes}
      fetchingServiceNowTicketTypes={fetchingServiceNowTicketTypes}
      serviceNowTicketTypesResponse={serviceNowTicketTypesResponse}
      serviceNowTicketTypesFetchError={serviceNowTicketTypesFetchError}
      refetchServiceNowMetadata={refetchServiceNowMetadata}
      fetchingServiceNowMetadata={fetchingServiceNowMetadata}
      serviceNowMetadataResponse={serviceNowMetadataResponse}
      serviceNowMetadataFetchError={serviceNowMetadataFetchError}
    />
  )
}
