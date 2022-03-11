/*
 * Copyright 2021 Harness Inc. All rights reserved.
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

import OverviewTopRecommendations from '@ce/components/OverviewPage/OverviewTopRecommendations'
import { RecommendationsDocument } from 'services/ce/services'

import ResponseData from '@ce/pages/recommendationList/__test__/ListData.json'

describe('test cases for overview top recommendations', () => {
  test('should be able to render top recommendations', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === RecommendationsDocument) {
          return fromValue(ResponseData)
        }
      }
    }

    const { container } = render(
      <TestWrapper>
        <Provider value={responseState as any}>
          <OverviewTopRecommendations />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
