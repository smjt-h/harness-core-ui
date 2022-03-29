/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { act, fireEvent, queryByText, render, waitFor } from '@testing-library/react'
import React from 'react'
import type { DocumentNode } from 'graphql'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { FetchPerspectiveListDocument } from 'services/ce/services'
import AnomaliesSettings from '../AnomaliesSettings'
import PerspectiveList from './PerspectiveList.json'

const params = {
  accountId: 'TEST_ACC'
}

jest.mock('services/ce', () => ({
  useListNotificationSettings: jest.fn().mockImplementation(() => {
    return {
      data: [
        {
          perspectiveId: 'ckdpZddDSSOoZmTYpl5Omg',
          perspectiveName: null,
          channels: [
            {
              type: 'SLACK',
              slackWebHookUrl: 'webhook-url-here',
              notificationChannelType: 'SLACK',
              channelUrls: ['webhook-url-here']
            },
            {
              type: 'EMAIL',
              emails: ['email1', 'email2'],
              notificationChannelType: 'EMAIL',
              channelUrls: ['email1', 'email2']
            },
            {
              type: 'MICROSOFT_TEAMS',
              microsoftTeamsUrl: 'teams-url-here',
              notificationChannelType: 'MICROSOFT_TEAMS',
              channelUrls: ['teams-url-here']
            }
          ]
        }
      ],
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
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
  })),
  useDeleteNotificationSettings: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    }
  }))
}))

describe('test case for anomalies settings drawer', () => {
  test('should be able to open alert creation modal', async () => {
    const hideDrawer = jest.fn()

    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveListDocument) {
          return fromValue(PerspectiveList)
        }
      }
    }

    const { container, getByText, getAllByText } = render(
      <Provider value={responseState as any}>
        <TestWrapper pathParams={params}>
          <AnomaliesSettings hideDrawer={hideDrawer} />
        </TestWrapper>
      </Provider>
    )

    const createNewAlert = queryByText(container, 'ce.anomalyDetection.settings.newAlertBtn')

    act(() => {
      fireEvent.click(createNewAlert!)
    })
    const modal = findDialogContainer()

    await waitFor(() => {
      expect(modal).toBeDefined()
      expect(getByText('ce.anomalyDetection.notificationAlerts.heading')).toBeDefined()
      expect(getAllByText('ce.anomalyDetection.notificationAlerts.overviewStep')).toBeDefined()
    })

    expect(modal).toMatchSnapshot()
  })
})
