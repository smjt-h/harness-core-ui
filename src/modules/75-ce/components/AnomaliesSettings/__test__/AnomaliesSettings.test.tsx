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
import * as ceServices from 'services/ce'
import AnomaliesSettings from '../AnomaliesSettings'
import PerspectiveList from './PerspectiveList.json'
import AlertList from './AnomaliesAlertList.json'

const params = {
  accountId: 'TEST_ACC'
}

jest.mock('services/ce', () => ({
  useListNotificationSettings: jest.fn().mockImplementation(() => {
    return {
      data: AlertList,
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

const hideDrawer = jest.fn()

describe('test case for anomalies settings drawer', () => {
  test('should be able to open alert creation modal', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveListDocument) {
          return fromValue(PerspectiveList)
        } else {
          return fromValue({})
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

  test('should be able to delete the anomaly alert from the list', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveListDocument) {
          return fromValue(PerspectiveList)
        } else {
          return fromValue({})
        }
      }
    }

    const { container } = render(
      <Provider value={responseState as any}>
        <TestWrapper pathParams={params}>
          <AnomaliesSettings hideDrawer={hideDrawer} />
        </TestWrapper>
      </Provider>
    )

    await waitFor(() => Promise.resolve())

    const deleteIcon = container.querySelector('span[data-icon="main-trash"]')
    act(() => {
      fireEvent.click(deleteIcon!)
    })
    expect(container).toMatchSnapshot()
    await waitFor(() => {
      expect(queryByText(document.body, 'ce.anomalyDetection.notificationAlerts.deleteAlertSuccessMsg')).toBeDefined()
    })
  })

  test('should be able to pre filled data on click of edit', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveListDocument) {
          return fromValue(PerspectiveList)
        } else {
          return fromValue({})
        }
      }
    }

    const { container } = render(
      <Provider value={responseState as any}>
        <TestWrapper pathParams={params}>
          <AnomaliesSettings hideDrawer={hideDrawer} />
        </TestWrapper>
      </Provider>
    )

    await waitFor(() => Promise.resolve())

    const editIcon = container.querySelector('span[data-icon="Edit"]')
    act(() => {
      fireEvent.click(editIcon!)
    })
    const modal = findDialogContainer()
    expect(modal).toBeDefined()
  })

  test('Should be able to hide the drawer on close', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveListDocument) {
          return fromValue(PerspectiveList)
        } else {
          return fromValue({})
        }
      }
    }

    const { container } = render(
      <Provider value={responseState as any}>
        <TestWrapper pathParams={params}>
          <AnomaliesSettings hideDrawer={hideDrawer} />
        </TestWrapper>
      </Provider>
    )

    const crossIcon = container.querySelector('[data-testid="closeDrawerIcon"]')
    act(() => {
      fireEvent.click(crossIcon!)
    })
    expect(hideDrawer).toBeCalledTimes(1)
  })

  test('Should show loader while loading the anomalies list', async () => {
    jest
      .spyOn(ceServices, 'useListNotificationSettings')
      .mockImplementation(() => ({ data: AlertList, loading: true, refetch: jest.fn, error: true } as any))

    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveListDocument) {
          return fromValue(PerspectiveList)
        } else {
          return fromValue({})
        }
      }
    }

    const { container } = render(
      <Provider value={responseState as any}>
        <TestWrapper pathParams={params}>
          <AnomaliesSettings hideDrawer={hideDrawer} />
        </TestWrapper>
      </Provider>
    )

    const spinner = container.querySelector('[data-testid="loader"]')
    expect(spinner).toBeTruthy()
  })

  test('Should update the active tab on tabs click', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveListDocument) {
          return fromValue(PerspectiveList)
        } else {
          return fromValue({})
        }
      }
    }

    const { container } = render(
      <Provider value={responseState as any}>
        <TestWrapper pathParams={params}>
          <AnomaliesSettings hideDrawer={hideDrawer} />
        </TestWrapper>
      </Provider>
    )

    const tab = container.querySelector('.tabContent')
    expect(tab).toBeDefined()
    act(() => {
      fireEvent.click(tab!)
    })
  })
})
