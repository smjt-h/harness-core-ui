/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import { useSessionStorage } from '../useSessionStorage'

const defaultData = 'testValue'

describe('useSessionStorage', () => {
  test('should store currently', async () => {
    const { result } = renderHook(() => useSessionStorage('testing', defaultData))

    //check if the value is set
    expect(result.current[0]).toBe(defaultData)

    //change value
    result.current[1]('testValue2')
    expect(result.current[0]).toBe('testValue2')
  })
  test('should render from stored', async () => {
    const { result } = renderHook(() => useSessionStorage('testing', defaultData))

    //check if previous value given
    expect(result.current[0]).toBe('testValue2')
  })
})
