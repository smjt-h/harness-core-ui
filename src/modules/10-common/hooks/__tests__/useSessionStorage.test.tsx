/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useSessionStorage } from '../useSessionStorage'

const defaultData = 'testValue'

const Wrapper = (): React.ReactElement => {
  const [testData, setTestData] = useSessionStorage('testing', defaultData)
  const click = () => {
    setTestData('testValue2')
  }

  return (
    <>
      <p>{testData}</p>
      <button onClick={click}>clickMe</button>
    </>
  )
}

describe('useSessionStorage', () => {
  test('should store currently', async () => {
    // // const wrapper: React.FC = ({ children }) => <TestWrapper>{children}</TestWrapper>
    // const { result } = renderHook(() => useSessionStorage('testing', defaultData))
    // expect(result.current[0]).toBe(defaultData)

    // result.current[1]('testvalue2')
    // // const [test, setTest] = result.current
    // expect(result.current[0]).toBe(defaultData)

    // setTest('hi')

    // expect(test).toBe('hi')

    const { container, getByText } = render(
      <TestWrapper>
        <Wrapper key={'stg'} />
      </TestWrapper>
    )

    fireEvent.click(getByText('clickMe'))
    expect(container).toMatchInlineSnapshot(`
      <div>
        <p>
          t
        </p>
        <button>
          clickMe
        </button>
      </div>
    `)
  })
})
