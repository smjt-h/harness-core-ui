/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { PAGE_NAME } from '../PageName'
import PageProvider, { usePage } from '../PageProvider'

describe('PageProvider', () => {
  test('should have page name', () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>
        <PageProvider pageName={PAGE_NAME.AccountResources}>{children}</PageProvider>
      </TestWrapper>
    )
    const { result } = renderHook(() => usePage(), { wrapper })

    expect(result.current.pageName).toBe(PAGE_NAME.AccountResources)
  })

  test('should NOT have page name', () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>
        <PageProvider>{children}</PageProvider>
      </TestWrapper>
    )
    const { result } = renderHook(() => usePage(), { wrapper })

    expect(result.current.pageName).toBeUndefined()
  })
})
