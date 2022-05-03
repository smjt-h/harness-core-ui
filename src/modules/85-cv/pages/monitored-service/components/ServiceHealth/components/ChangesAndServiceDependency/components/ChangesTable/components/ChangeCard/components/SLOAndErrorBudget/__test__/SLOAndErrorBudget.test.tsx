/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { responseSLODashboardDetail } from '@cv/pages/slos/CVSLODetailsPage/__test__/CVSLODetailsPage.mock'
import SLOAndErrorBudget from '../SLOAndErrorBudget'
import { dashboardWidgetsResponse } from './SLOAndErrorBudget.mock'

const monitoredServiceIdentifier = 'monitored_service_identifier'

jest.mock('services/cv', () => ({
  useGetSLODashboardWidgets: jest.fn().mockImplementation(() => ({ data: dashboardWidgetsResponse, loading: false })),
  useGetSLODetails: jest
    .fn()
    .mockImplementation(() => ({ data: responseSLODashboardDetail, loading: false, error: null, refetch: jest.fn() }))
}))

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper>
      <SLOAndErrorBudget monitoredServiceIdentifier={monitoredServiceIdentifier} startTime={1000} endTime={2000} />
    </TestWrapper>
  )
}

describe('SLOAndErrorBudget', () => {
  test('should render the component', async () => {
    renderComponent()

    expect(screen.getByText('cv.pleaseSelectSLOToGetTheData')).toBeInTheDocument()

    await waitFor(() =>
      expect(cvServices.useGetSLODashboardWidgets).toHaveBeenLastCalledWith({
        queryParams: { monitoredServiceIdentifier }
      })
    )

    userEvent.click(screen.getByText('SLO 1'))

    expect(screen.queryByText('cv.pleaseSelectSLOToGetTheData')).not.toBeInTheDocument()
    expect(screen.getAllByText('SLO 1')).toHaveLength(2)

    userEvent.click(screen.getAllByText('SLO 1')[0])

    expect(screen.getByText('cv.pleaseSelectSLOToGetTheData')).toBeInTheDocument()
  })

  test('should handle loading state of graph', () => {
    jest
      .spyOn(cvServices, 'useGetSLODetails')
      .mockImplementation(() => ({ data: null, loading: true, error: null, refetch: jest.fn() } as any))

    const { container } = renderComponent()

    userEvent.click(screen.getByText('SLO 1'))

    expect(container.querySelector('span[data-icon="steps-spinner"]')).toBeInTheDocument()
  })

  test('should handle error state of graph', () => {
    const errorMessage = 'TEST ERROR MESSAGE'
    const refetch = jest.fn()
    jest
      .spyOn(cvServices, 'useGetSLODetails')
      .mockImplementation(() => ({ data: null, loading: false, error: { message: errorMessage }, refetch } as any))

    renderComponent()

    userEvent.click(screen.getByText('SLO 1'))

    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    userEvent.click(screen.getByText('Retry'))

    expect(refetch).toBeCalled()
  })

  test('should handle loading of SLO widgets', () => {
    jest
      .spyOn(cvServices, 'useGetSLODashboardWidgets')
      .mockImplementation(() => ({ data: null, loading: true, error: null, refetch: jest.fn() } as any))

    const { container } = renderComponent()

    expect(container.getElementsByClassName('bp3-skeleton')).toHaveLength(4)
  })

  test('should handle error of SLO widgets', () => {
    const errorMessage = 'TEST ERROR MESSAGE'
    jest
      .spyOn(cvServices, 'useGetSLODashboardWidgets')
      .mockImplementation(
        () => ({ data: null, loading: false, error: { message: errorMessage }, refetch: jest.fn() } as any)
      )

    renderComponent()

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })
})
