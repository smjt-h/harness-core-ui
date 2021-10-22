import React from 'react'
import { render, waitFor } from '@testing-library/react'
import * as dashboardServices from 'services/dashboard-service'
import { TestWrapper } from '@common/utils/testUtils'
import LandingDashboardContext, { DashboardTimeRange } from '@common/factories/LandingDashboardContext'
import LandingDashboardSummaryWidget from '../LandingDashboardSummaryWidget'

import overviewCountMock from '../../OverviewGlanceCards/__tests__/overviewMock.json'
import topProjectsData from './topProjectsMock.json'

const getCountData = jest.fn(() => {
  return Promise.resolve(overviewCountMock)
})

const getTopProjectsData = jest.fn(() => {
  return Promise.resolve(topProjectsData)
})

jest
  .spyOn(dashboardServices, 'useGetCounts')
  .mockImplementation(() => ({ mutate: getCountData, refetch: getCountData, data: overviewCountMock } as any))

jest
  .spyOn(dashboardServices, 'useGetTopProjects')
  .mockImplementation(() => ({ mutate: getTopProjectsData, refetch: getTopProjectsData, data: topProjectsData } as any))

describe('OverviewGlanceCards', () => {
  test('OverviewGlanceCards rendering', async () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <LandingDashboardContext.Provider
          value={{
            selectedTimeRange: DashboardTimeRange['30Days'],
            selectTimeRange: () => void 0,
            scope: { accountIdentifier: 'testAccount' }
          }}
        >
          <LandingDashboardSummaryWidget />
        </LandingDashboardContext.Provider>
      </TestWrapper>
    )

    await waitFor(() => expect(getCountData).toBeCalledTimes(1))
    await waitFor(() => expect(getTopProjectsData).toBeCalledTimes(1))

    expect(queryByText('+137')).toBeInTheDocument()
    expect(queryByText('deploymentsText')).toBeInTheDocument()
    expect(queryByText('dev test')).toBeInTheDocument()
    expect(queryByText('47')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
