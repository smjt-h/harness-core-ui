/* eslint-disable @typescript-eslint/ban-types */
import type { MultiSelectOption } from '@wings-software/uicore'

import { StringUtils } from '@common/exports'
import type {
  ConnectorFilterProperties,
  FilterDTO,
  ConnectorStatusStatistics,
  ConnectorTypeStatistics,
  ResponseConnectorStatistics
} from 'services/cd-ng'
import type { FilterDataInterface, FilterInterface } from '@common/components/Filter/Constants'

export const getValidFilterArguments = (formData: Record<string, any>): ConnectorFilterProperties => {
  const typeOptions = formData?.types?.map((type: MultiSelectOption) => type?.value)
  const statusOptions = formData?.connectivityStatuses
    ?.filter((status: MultiSelectOption) => status?.value !== 'NA')
    .map((status: MultiSelectOption) => status?.value)
  return {
    connectorNames: formData?.connectorNames || [],
    connectorIdentifiers: formData?.connectorIdentifiers || [],
    description: formData?.description || '',
    types: typeOptions,
    connectivityStatuses: statusOptions,
    tags: formData?.tags
  }
}

export type ConnectorFormType = Omit<ConnectorFilterProperties, 'types' | 'connectivityStatuses'> & {
  types?: MultiSelectOption[]
  connectivityStatuses?: MultiSelectOption[]
}

export const createRequestBodyPayload = ({
  isUpdate,
  data,
  projectIdentifier,
  orgIdentifier
}: {
  isUpdate: boolean
  data: FilterDataInterface<ConnectorFormType, FilterInterface>
  projectIdentifier: string
  orgIdentifier: string
}): FilterDTO => {
  const {
    metadata: { name: _name, filterVisibility, identifier },
    formValues
  } = data
  const {
    connectorNames: _connectorNames,
    connectorIdentifiers: _connectorIdentifiers,
    description: _description,
    types: _types,
    connectivityStatuses: _connectivityStatuses,
    tags: _tags
  } = getValidFilterArguments(formValues)
  return {
    name: _name,
    identifier: isUpdate ? identifier : StringUtils.getIdentifierFromName(_name),
    projectIdentifier,
    orgIdentifier,
    filterVisibility: filterVisibility,
    filterProperties: {
      filterType: 'Connector',
      connectorNames: typeof _connectorNames === 'string' ? [_connectorNames] : _connectorNames,
      connectorIdentifiers: typeof _connectorIdentifiers === 'string' ? [_connectorIdentifiers] : _connectorIdentifiers,
      description: _description,
      types: _types,
      connectivityStatuses: _connectivityStatuses,
      tags: _tags
    } as ConnectorFilterProperties
  }
}

type supportedTypes = string | number | boolean | object

const tagSeparator = ' : '

export const renderItemByType = (data: supportedTypes | Array<supportedTypes> | object): string => {
  if (Array.isArray(data)) {
    return data.join(', ')
  } else if (typeof data === 'object') {
    return Object.entries(data as object)
      .map(([key, value]) => {
        return key.toString().concat(value ? tagSeparator.concat(value.toString()) : '')
      })
      .join(', ')
  } else if (typeof data === 'number') {
    return data.toString()
  } else if (typeof data === 'boolean') {
    return data ? 'true' : 'false'
  }
  return typeof data === 'string' ? data : ''
}

export const getAggregatedConnectorFilter = (
  query: string,
  filter: ConnectorFilterProperties
): ConnectorFilterProperties | undefined => {
  let existingNamesInFilter
  if (query) {
    /* istanbul ignore else */
    existingNamesInFilter = filter?.connectorNames
    if (existingNamesInFilter && Array.isArray(existingNamesInFilter) && existingNamesInFilter.length > 0) {
      /* istanbul ignore else */
      if (!existingNamesInFilter.includes(query)) {
        /* istanbul ignore else */
        existingNamesInFilter.push(query)
      }
    } else {
      existingNamesInFilter = [query]
    }
  }
  const res = Object.assign(filter, { connectorNames: query ? existingNamesInFilter : filter?.connectorNames })
  return res
}

export const validateForm = (
  values: Partial<ConnectorFormType>,
  typeMultiSelectValues: string[],
  connectivityStatusMultiValues: string[],
  metaData: ResponseConnectorStatistics
): { typeErrors: Set<string>; connectivityStatusErrors: Set<string> } => {
  const typeErrors = validateMultiSelectFormInput(
    new Set<string>(typeMultiSelectValues),
    new Set<string>(
      values?.types?.map(
        (type: MultiSelectOption) => type?.value as string,
        getOptionsForMultiSelect(ConnectorStatCategories.STATUS, metaData || {})?.map(option => option.value)
      )
    )
  )
  const connectivityStatusErrors = validateMultiSelectFormInput(
    new Set<string>(connectivityStatusMultiValues),
    new Set(
      values?.connectivityStatuses?.map(
        (status: MultiSelectOption) => status?.value as string,
        getOptionsForMultiSelect(ConnectorStatCategories.STATUS, metaData || {})?.map(option => option.value)
      )
    )
  )
  return {
    typeErrors,
    connectivityStatusErrors
  }
}
const validateMultiSelectFormInput = (allowedValues?: Set<string>, inputValues?: Set<string>): Set<string> => {
  if (allowedValues?.size === 0 || inputValues?.size === 0) {
    return new Set<string>()
  }
  return new Set<string>([...(inputValues || new Set<string>())].filter(value => !allowedValues?.has(value)))
}

export const enum ConnectorStatCategories {
  STATUS = 'STATUS',
  TYPE = 'TYPE',
  TAGS = 'TAGS'
}

export const createOption = (val: string, count?: number): MultiSelectOption => {
  const valueSubLabel = count
    ? count > 0
      ? val
          .concat(' ')
          .concat('(')
          .concat((count || '').toString())
          .concat(')')
      : val
    : val
  return {
    label: valueSubLabel,
    value: val
  } as MultiSelectOption
}

export const getOptionsForMultiSelect = (
  category: ConnectorStatCategories,
  metaData: ResponseConnectorStatistics
): MultiSelectOption[] => {
  if (category === ConnectorStatCategories.STATUS) {
    return (
      metaData?.data?.statusStats
        ?.filter((item: ConnectorStatusStatistics) => item?.status)
        ?.map((item: ConnectorStatusStatistics) => {
          //TODO @vardan make it match mocks when label accepts custom renderer as well
          const val = item?.status || ''
          return createOption(val, item?.count)
        }) || []
    )
  } else if (category === ConnectorStatCategories.TYPE) {
    return (
      metaData?.data?.typeStats?.map((item: ConnectorTypeStatistics) => {
        const val = item?.type || 'NA'
        return createOption(val, item?.count)
      }) || []
    )
  }
  return []
}
