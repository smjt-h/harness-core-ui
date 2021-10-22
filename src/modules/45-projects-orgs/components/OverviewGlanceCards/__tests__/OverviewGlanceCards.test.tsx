import React from 'react'
import { render, waitFor } from '@testing-library/react'
import * as dashboardServices from 'services/dashboard-service'
import { TestWrapper } from '@common/utils/testUtils'
import LandingDashboardContext, { DashboardTimeRange } from '@common/factories/LandingDashboardContext'
import OverviewGlanceCards from '../OverviewGlanceCards'

import overviewCountMock from './overviewMock.json'

const getData = jest.fn(() => {
  return Promise.resolve(overviewCountMock)
})

jest
  .spyOn(dashboardServices, 'useGetCounts')
  .mockImplementation(() => ({ mutate: getData, refetch: getData, data: overviewCountMock } as any))

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
          <OverviewGlanceCards />
        </LandingDashboardContext.Provider>
      </TestWrapper>
    )

    await waitFor(() => expect(getData).toBeCalledTimes(1))
    await waitFor(() => expect(queryByText('projectsText')).toBeInTheDocument())

    expect(queryByText('+137')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
