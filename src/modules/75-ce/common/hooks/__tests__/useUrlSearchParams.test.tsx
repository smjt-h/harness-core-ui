/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { renderHook } from '@testing-library/react-hooks'
import useUrlSearchParams from '../useUrlSearchParams'

describe('url search params tests', () => {
  test('should get desired query param', () => {
    const wrapper = ({ children }: any) => {
      return (
        <TestWrapper path="/testPath" queryParams={{ q: 123 }}>
          {children}
        </TestWrapper>
      )
    }
    const { result } = renderHook(() => useUrlSearchParams(), {
      wrapper
    })
    const param = result.current.getQueryParam('q')
    expect(param).toEqual('123')
  })

  test('should get query params', () => {
    const wrapper = ({ children }: any) => {
      return <TestWrapper path="/testPath">{children}</TestWrapper>
    }
    const { result } = renderHook(() => useUrlSearchParams(), {
      wrapper
    })
    const params = result.current.getUrlQueryPrams({ search: 'text' })
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.set('search', 'text')
    expect(params.get('search')).toEqual(urlSearchParams.get('search'))
  })

  test('should set url with params', () => {
    const wrapper = ({ children }: any) => {
      return <TestWrapper path="/testPath">{children}</TestWrapper>
    }
    const { result } = renderHook(() => useUrlSearchParams(), {
      wrapper
    })
    result.current.setParamsToUrl({ search: 'text' })
    const urlSearchParams = new URLSearchParams('?search=text')
    expect(urlSearchParams.get('search')).toEqual('text')
  })

  test('should remove param from url', () => {
    const wrapper = ({ children }: any) => {
      return (
        <TestWrapper path="/testPath" queryParams={{ search: 'text' }}>
          {children}
        </TestWrapper>
      )
    }
    const { result } = renderHook(() => useUrlSearchParams(), {
      wrapper
    })
    result.current.setParamsToUrl({ search: '' })
  })
})
