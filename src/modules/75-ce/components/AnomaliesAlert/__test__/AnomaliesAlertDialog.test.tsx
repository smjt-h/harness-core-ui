/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// import { Container, Dialog, Formik } from '@harness/uicore'
import { render } from '@testing-library/react'
import React from 'react'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { Provider } from 'urql'
import { TestWrapper } from '@common/utils/testUtils'
import { FetchPerspectiveListDocument } from 'services/ce/services'
import { AnomalyAlertDialog } from '../AnomaliesAlertDialog'
import PerspectiveList from './PerspectiveList.json'

const selectedAlert = {
  perspetiveId: 'perspectiveId',
  channels: []
}

const params = {
  accountId: 'TEST_ACC'
}

jest.mock('services/ce', () => {
  return {
    useCreateNotificationSetting: jest.fn().mockImplementation(() => ({
      mutate: async () => {
        return {
          status: 'SUCCESS',
          data: {}
        }
      }
    })),
    useUpdateNotificationSetting: jest.fn().mockImplementation(() => ({
      mutate: async () => {
        return {
          status: 'SUCCESS',
          data: {}
        }
      }
    }))
  }
})

describe('Test case for anomalies new alert creation', () => {
  test('Anomalies alert dialog should open', async () => {
    const hideAnomaliesAlertModal = jest.fn()
    const handleSubmit = jest.fn()

    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveListDocument) {
          return fromValue(PerspectiveList)
        }
        return fromValue({})
      }
    }

    const { container, getByText } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <AnomalyAlertDialog
            hideAnomaliesAlertModal={hideAnomaliesAlertModal}
            handleSubmit={handleSubmit}
            notificationData={selectedAlert}
          />
        </Provider>
      </TestWrapper>
    )

    expect(getByText('ce.anomalyDetection.notificationAlerts.selectPerspectiveLabel')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
