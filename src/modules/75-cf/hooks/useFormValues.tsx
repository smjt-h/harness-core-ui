/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, FC, useContext } from 'react'
import type { FormikErrors } from 'formik'

export interface FormValuesProviderProps {
  values: any
  setField: (fieldName: string, value: unknown) => void
  errors?: FormikErrors<any>
}

export interface UseFormValuesPayload<FormType> {
  values: FormType
  setField: FormValuesProviderProps['setField']
  errors: FormikErrors<any>
}

const FormValuesContext = createContext({
  values: {},
  setField: (_fieldName: string, _value: unknown) => {
    return
  },
  errors: {}
})

export const FormValuesProvider: FC<FormValuesProviderProps> = ({ children, values, setField, errors = {} }) => (
  <FormValuesContext.Provider value={{ values, setField, errors }}>{children}</FormValuesContext.Provider>
)

export default function useFormValues<FormType>(): UseFormValuesPayload<FormType> {
  return useContext(FormValuesContext) as UseFormValuesPayload<FormType>
}
