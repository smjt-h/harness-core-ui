/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep } from 'lodash-es'
import { render } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { SelectGCODashboards } from '../SelectGCODashboards'
import { sourceData, DefaultObject, dashBoardResponse } from './SelectGCODashboards.mock'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

function WrapperComponent({ data }: any): JSX.Element {
  return (
    <TestWrapper>
      <SetupSourceTabs data={data} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <SelectGCODashboards key="selectGCODashboards" />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('MetricDashboardList unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should initialize selected dashboards with data', async () => {
    jest
      .spyOn(cvService, 'useGetStackdriverDashboards')
      .mockReturnValue({ loading: false, error: null, data: dashBoardResponse, refetch: jest.fn() } as any)
    const { getAllByRole } = render(<WrapperComponent data={cloneDeep(DefaultObject)} />)
    expect(getAllByRole('row').length - 1).toBe(dashBoardResponse.data.content.length)
  })

  test('Should initialize selected dashboards based on no data', async () => {
    jest
      .spyOn(cvService, 'useGetStackdriverDashboards')
      .mockReturnValue({ loading: false, error: null, data: {}, refetch: jest.fn() } as any)
    const { getByText } = render(<WrapperComponent data={cloneDeep(DefaultObject)} />)
    expect(getByText('cv.monitoringSources.gco.selectDashboardsPage.noDataText')).toBeTruthy()
  })

  test('Should initialize selected dashboards based on metrics provided from source', async () => {
    jest
      .spyOn(cvService, 'useGetStackdriverDashboards')
      .mockReturnValue({ loading: false, error: null, data: dashBoardResponse, refetch: jest.fn() } as any)

    const { container, getAllByRole } = render(<WrapperComponent data={sourceData} />)
    expect(getAllByRole('row').length - 1).toBe(dashBoardResponse.data.content.length)
    expect(container.querySelectorAll('input[checked=""]').length).toEqual(1)
  })
})
