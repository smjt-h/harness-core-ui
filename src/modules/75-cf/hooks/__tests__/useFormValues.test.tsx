/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import type { FormikErrors } from 'formik'
import useFormValues, { FormValuesProvider, FormValuesProviderProps } from '../useFormValues'

const render = (props: Partial<FormValuesProviderProps> = {}) =>
  renderHook(() => useFormValues(), {
    wrapper: FormValuesProvider,
    initialProps: { values: { a: 1 }, setField: jest.fn(), ...props }
  })

describe('useFormValues', function () {
  test('it should store the values passed', async () => {
    const values = { a: 1, b: 2, c: { d: 3 } }

    const { result } = render({ values })

    expect(result.current).toEqual(expect.objectContaining({ values }))
  })

  test('it should pass through the setField function', async () => {
    const setFieldMock = jest.fn()

    const { result } = render({ setField: setFieldMock })

    expect(result.current).toEqual(expect.objectContaining({ setField: setFieldMock }))
  })

  test('it should store form errors', async () => {
    const errors: FormikErrors<any> = {}

    const { result } = render({ errors })

    expect(result.current).toEqual(expect.objectContaining({ errors }))
  })
})
