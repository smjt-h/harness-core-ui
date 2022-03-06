/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getByText, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DeploymentsWidget } from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget'
import { deploymentsInfo } from '@cd/mock'
import * as cdngServices from 'services/cd-ng'

jest.mock('highcharts-react-official', () => () => <></>)

jest.spyOn(cdngServices, 'useGetServiceDeploymentsInfo').mockImplementation(() => {
  return { loading: false, error: false, data: deploymentsInfo, refetch: jest.fn() } as any
})

const getLoader = (container: HTMLElement): Element => container.querySelector('[data-test="deploymentsWidgetLoader"]')!
const getError = (container: HTMLElement): Element => container.querySelector('[data-test="deploymentsWidgetError"]')!
const getEmpty = (container: HTMLElement): Element => container.querySelector('[data-test="deploymentsWidgetEmpty"]')!
const getContent = (container: HTMLElement): Element =>
  container.querySelector('[data-test="deploymentsWidgetContent"]')!

describe('DeploymentsWidget', () => {
  test('should render DeploymentsWidget', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <DeploymentsWidget />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should display loading state', () => {
    jest.spyOn(cdngServices, 'useGetServiceDeploymentsInfo').mockImplementation(() => {
      return { loading: true, error: false, data: [], refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <DeploymentsWidget />
      </TestWrapper>
    )
    expect(getLoader(container)).toBeTruthy()
    expect(getError(container)).toBeFalsy()
    expect(getEmpty(container)).toBeFalsy()
    expect(getContent(container)).toBeFalsy()
  })

  test('should display error state', () => {
    const refetch = jest.fn()
    jest.spyOn(cdngServices, 'useGetServiceDeploymentsInfo').mockImplementation(() => {
      return { loading: false, error: true, data: [], refetch } as any
    })
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <DeploymentsWidget />
      </TestWrapper>
    )
    expect(getLoader(container)).toBeFalsy()
    expect(getError(container)).toBeTruthy()
    expect(getEmpty(container)).toBeFalsy()
    expect(getContent(container)).toBeFalsy()

    expect(getByText(document.body, 'Retry')).toBeDefined()
    fireEvent.click(getByText(document.body, 'Retry') as HTMLButtonElement)
    expect(refetch).toBeCalledTimes(1)
  })

  test('should display correct data', () => {
    jest.spyOn(cdngServices, 'useGetServiceDeploymentsInfo').mockImplementation(() => {
      return { loading: false, error: false, data: deploymentsInfo, refetch: jest.fn() } as any
    })
    const { container, queryByText } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <DeploymentsWidget />
      </TestWrapper>
    )
    expect(getLoader(container)).toBeFalsy()
    expect(getError(container)).toBeFalsy()
    expect(getEmpty(container)).toBeFalsy()

    expect(queryByText('deploymentsText')).toBeInTheDocument()
    expect(queryByText('57')).toBeInTheDocument()
    expect(queryByText('common.failureRate')).toBeInTheDocument()
    expect(queryByText('24.2%')).toBeInTheDocument()
    expect(queryByText('pipeline.deploymentFrequency')).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  test('should refetch data if time range is changed', () => {
    const refetch = jest.fn()
    jest.spyOn(cdngServices, 'useGetServiceDeploymentsInfo').mockImplementation(() => {
      return { loading: false, error: false, data: [], refetch } as any
    })
    render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <DeploymentsWidget />
      </TestWrapper>
    )

    expect(refetch).toBeCalledTimes(0)
    // Todo - Jasmeet - update this test when date picker component is integrated in deployment widget
  })
})
