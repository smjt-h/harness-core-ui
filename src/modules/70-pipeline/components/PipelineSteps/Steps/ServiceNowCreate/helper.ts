/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'

import type { ServiceNowCreateData } from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/types'
import type { ServiceNowTicketTypeSelectOption } from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/types'

export const resetForm = (formik: FormikProps<ServiceNowCreateData>, parent: string) => {
  if (parent === 'connectorRef') {
    formik.setFieldValue('spec.ticketType', '')
  }
}

export const processFormData = (values: ServiceNowCreateData): ServiceNowCreateData => {
  return {
    ...values,
    spec: {
      delegateSelectors: values.spec.delegateSelectors,
      connectorRef:
        getMultiTypeFromValue(values.spec.connectorRef as SelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.connectorRef as SelectOption)?.value?.toString()
          : values.spec.connectorRef,
      ticketType:
        getMultiTypeFromValue(values.spec.ticketType as ServiceNowTicketTypeSelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.ticketType as ServiceNowTicketTypeSelectOption)?.key?.toString()
          : values.spec.ticketType
    }
  }
}

export const processInitialValues = (values: ServiceNowCreateData): ServiceNowCreateData => {
  return {
    ...values,
    spec: {
      ...values.spec
    }
  }
}

// export const getSelectedFieldsToBeAddedInForm = (
//   newFields: JiraFieldNG[],
//   existingFields: JiraFieldNGWithValue[] = [],
//   existingKVFields: JiraCreateFieldType[]
// ): JiraFieldNGWithValue[] => {
//   const toReturn: JiraFieldNGWithValue[] = []
//   newFields.forEach(field => {
//     const alreadyPresent = existingFields.find(existing => existing.name === field.name)
//     const alreadyPresentKVField = existingKVFields.find(kv => kv.name === field.name)
//     if (!alreadyPresent && !alreadyPresentKVField) {
//       toReturn.push({ ...field, value: !isEmpty(field.allowedValues) ? [] : '' })
//     } else {
//       toReturn.push({ ...field, value: alreadyPresent !== undefined ? alreadyPresent?.value : '' })
//     }
//   })
//   return toReturn
// }

// export const getKVFieldsToBeAddedInForm = (
//   newFields: JiraCreateFieldType[],
//   existingFields: JiraCreateFieldType[] = [],
//   existingSelectedFields: JiraFieldNGWithValue[] = []
// ): JiraCreateFieldType[] => {
//   const toReturn: JiraCreateFieldType[] = [...existingFields]
//   newFields.forEach(field => {
//     const alreadyPresent = existingFields.find(existing => existing.name === field.name)
//     const alreadyPresentSelectedField = existingSelectedFields.find(existing => existing.name === field.name)
//     if (!alreadyPresent && !alreadyPresentSelectedField) {
//       toReturn.push(field)
//     }
//   })
//   return toReturn
// }

// export const updateMap = (alreadySelectedFields: JiraFieldNG[]): Record<string, boolean> => {
//   const map: Record<string, boolean> = {}
//   if (!isEmpty(alreadySelectedFields)) {
//     alreadySelectedFields.forEach(field => {
//       map[field.name] = true
//     })
//   }
//   return map
// }
