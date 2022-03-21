/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiSelectOption, MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'
import type { ServiceNowFieldAllowedValueNG, ServiceNowFieldNG } from 'services/cd-ng'
import type { ServiceNowCreateData, ServiceNowCreateFieldType, ServiceNowFieldNGWithValue } from './types'
import type { ServiceNowTicketTypeSelectOption } from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/types'

export const resetForm = (formik: FormikProps<ServiceNowCreateData>, parent: string) => {
  if (parent === 'connectorRef') {
    formik.setFieldValue('spec.ticketType', '')
    formik.setFieldValue('spec.fields', [])
  }

  if (parent === 'ticketType') {
    formik.setFieldValue('spec.fields', [])
  }
}

export const processFieldsForSubmit = (values: ServiceNowCreateData): ServiceNowCreateFieldType[] => {
  const toReturn: ServiceNowCreateFieldType[] = []
  values.spec.selectedFields?.forEach((field: ServiceNowFieldNGWithValue) => {
    const name = field.name
    const value =
      typeof field.value === 'string' || typeof field.value === 'number'
        ? field.value
        : Array.isArray(field.value)
        ? (field.value as MultiSelectOption[]).map(opt => opt.value.toString()).join(',')
        : typeof field.value === 'object'
        ? (field.value as SelectOption).value?.toString()
        : ''
    // The return value should be comma separated string or a number
    toReturn.push({ name, value })
  })
  values.spec.fields?.forEach((kvField: ServiceNowCreateFieldType) => {
    const alreadyExists = toReturn.find(ff => ff.name === kvField.name)
    if (!alreadyExists) {
      toReturn.push(kvField)
    }
  })
  return toReturn
}

export const getInitialValueForSelectedField = (
  savedFields: ServiceNowCreateFieldType[],
  field: ServiceNowFieldNG
): string | number | SelectOption | MultiSelectOption[] => {
  const savedValue = savedFields.find(sf => sf.name === field.name)?.value
  if (typeof savedValue === 'number') {
    return savedValue as number
  } else if (typeof savedValue === 'string') {
    if (field.allowedValues && field.schema.array) {
      //field.schema.type === 'option'
      // multiselect
      // return multiselectoption[]
      const splitValues = (savedValue as string).split(',')
      return splitValues.map(splitvalue => ({ label: splitvalue, value: splitvalue })) as MultiSelectOption[]
    } else if (field.allowedValues) {
      //field.schema.type === 'option'
      // singleselect
      // return selectoption
      return { label: savedValue, value: savedValue } as SelectOption
    }
    return savedValue as string
  }
  return ''
}

export const processFormData = (values: ServiceNowCreateData): ServiceNowCreateData => {
  return {
    ...values,
    spec: {
      delegateSelectors: values.spec.delegateSelectors,
      fieldType: values.spec.fieldType,
      connectorRef:
        getMultiTypeFromValue(values.spec.connectorRef as SelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.connectorRef as SelectOption)?.value?.toString()
          : values.spec.connectorRef,
      ticketType:
        getMultiTypeFromValue(values.spec.ticketType as ServiceNowTicketTypeSelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.ticketType as ServiceNowTicketTypeSelectOption)?.key?.toString()
          : values.spec.ticketType,
      fields: processFieldsForSubmit(values)
    }
  }
}

export const getKVFields = (values: ServiceNowCreateData): ServiceNowCreateFieldType[] => {
  return processFieldsForSubmit(values)
}

export const processInitialValues = (values: ServiceNowCreateData): ServiceNowCreateData => {
  return {
    ...values,
    spec: {
      delegateSelectors: values.spec.delegateSelectors,
      connectorRef: values.spec.connectorRef,
      fieldType: values.spec.fieldType,
      ticketType:
        values.spec.ticketType && getMultiTypeFromValue(values.spec.ticketType) === MultiTypeInputType.FIXED
          ? {
              label: values.spec.ticketType.toString(),
              value: values.spec.ticketType.toString(),
              key: values.spec.ticketType.toString()
            }
          : values.spec.ticketType,
      fields: values.spec.fields
    }
  }
}

export const getSelectedFieldsToBeAddedInForm = (
  newFields: ServiceNowFieldNG[],
  existingFields: ServiceNowFieldNGWithValue[] = [],
  existingKVFields: ServiceNowCreateFieldType[]
): ServiceNowFieldNGWithValue[] => {
  const toReturn: ServiceNowFieldNGWithValue[] = []
  newFields.forEach(field => {
    const alreadyPresent = existingFields.find(existing => existing.name === field.name)
    const alreadyPresentKVField = existingKVFields.find(kv => kv.name === field.name)
    if (!alreadyPresent && !alreadyPresentKVField) {
      toReturn.push({ ...field, value: !isEmpty(field.allowedValues) ? [] : '' })
    } else {
      toReturn.push({ ...field, value: alreadyPresent !== undefined ? alreadyPresent?.value : '' })
    }
  })
  return toReturn
}

export const getKVFieldsToBeAddedInForm = (
  newFields: ServiceNowCreateFieldType[],
  existingFields: ServiceNowCreateFieldType[] = [],
  existingSelectedFields: ServiceNowFieldNGWithValue[] = []
): ServiceNowCreateFieldType[] => {
  const toReturn: ServiceNowCreateFieldType[] = [...existingFields]
  newFields.forEach(field => {
    const alreadyPresent = existingFields.find(existing => existing.name === field.name)
    const alreadyPresentSelectedField = existingSelectedFields.find(existing => existing.name === field.name)
    if (!alreadyPresent && !alreadyPresentSelectedField) {
      toReturn.push(field)
    }
  })
  return toReturn
}

export const updateMap = (alreadySelectedFields: ServiceNowFieldNG[]): Record<string, boolean> => {
  const map: Record<string, boolean> = {}
  if (!isEmpty(alreadySelectedFields)) {
    alreadySelectedFields.forEach(field => {
      map[field.name] = true
    })
  }
  return map
}

export const setAllowedValuesOptions = (allowedValues: ServiceNowFieldAllowedValueNG[]): MultiSelectOption[] =>
  allowedValues.map(allowedValue => ({
    label: allowedValue.value || allowedValue.name || allowedValue.id || '',
    value: allowedValue.value || allowedValue.name || allowedValue.id || ''
  }))
