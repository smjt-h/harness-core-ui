/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { TestWrapper } from '@common/utils/testUtils'
import {
  FetchPerspectiveDetailsSummaryDocument,
  FetchPerspectiveForecastCostDocument,
  FetchCcmMetaDataDocument,
  FetchperspectiveGridDocument,
  FetchOverviewTimeSeriesDocument,
  RecommendationsDocument
} from 'services/ce/services'
// import { useGetPerspective } from 'services/ce'
import OverviewPage from '../OverviewPage'

import SummaryResponse from './SummaryResponse.json'
import ForecastResponse from './ForecastResponse.json'
import CCMMetaDataResponse from './CCMMetaDataResponse.json'
import NoCCMMetaDataResponse from './NoCCMMetaDataResponse.json'
import CloudCostResponse from './CloudCostResponse.json'
import OverviewTimeSeriesResponse from './OverviewTimeSeriesResponse.json'

jest.mock('services/ce', () => ({
  ...(jest.requireActual('services/ce') as any)
}))

jest.mock('@ce/components/CEChart/CEChart', () => 'mock')

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

describe('test cases for Overview Page', () => {
  test('should be able to render the overview dashboard', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchCcmMetaDataDocument) {
          return fromValue(CCMMetaDataResponse)
        }
        if (query === FetchPerspectiveDetailsSummaryDocument) {
          return fromValue(SummaryResponse)
        }
        if (query === FetchPerspectiveForecastCostDocument) {
          return fromValue(ForecastResponse)
        }
        if (query === FetchperspectiveGridDocument) {
          return fromValue(CloudCostResponse)
        }
        if (query === FetchOverviewTimeSeriesDocument) {
          return fromValue(OverviewTimeSeriesResponse)
        }
        if (query === RecommendationsDocument) {
          return fromValue(OverviewTimeSeriesResponse)
        }
        return fromValue({})
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <OverviewPage />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render NoData page when cluster and cloud data are not present', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchCcmMetaDataDocument) {
          return fromValue(NoCCMMetaDataResponse)
        }
        if (query === FetchPerspectiveDetailsSummaryDocument) {
          return fromValue(SummaryResponse)
        }
        if (query === FetchPerspectiveForecastCostDocument) {
          return fromValue(ForecastResponse)
        }
        return fromValue({})
      }
    }

    const { container, getByText } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <OverviewPage />
        </Provider>
      </TestWrapper>
    )

    expect(getByText('ce.overview.noData.info')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
