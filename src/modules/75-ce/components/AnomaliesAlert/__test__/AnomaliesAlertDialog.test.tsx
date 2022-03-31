/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { act, fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { Provider } from 'urql'
import { Dialog, Formik, FormikForm, StepWizard } from '@harness/uicore'
import type { IDialogProps } from '@blueprintjs/core'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { FetchPerspectiveListDocument } from 'services/ce/services'
import { clickSubmit } from '@common/utils/JestFormHelper'
import { useCreateNotificationSetting } from 'services/ce'
import { AlertOverview, NotificationMethod } from '../AnomaliesAlertDialog'
import PerspectiveList from './PerspectiveList.json'

const selectedAlert = {
  perspetiveId: 'perspectiveId',
  channels: [
    {
      notificationChannelType: 'SLACK',
      channelUrls: []
    }
  ]
}

const params = {
  accountId: 'TEST_ACC'
}

const modalPropsLight: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 1100,
    position: 'relative',
    minHeight: 600,
    borderLeft: 0,
    paddingBottom: 0,
    overflow: 'hidden'
  }
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
    const { mutate: createNotificationAlert } = useCreateNotificationSetting({
      queryParams: {
        accountIdentifier: 'accountId',
        perspectiveId: ''
      }
    })
    const queryParams = {
      perspectiveId: 'perspective',
      accountIdentifier: 'accountId'
    }
    const handleSubmit = jest.fn().mockImplementation(async () => {
      try {
        await createNotificationAlert({ channels: [] }, { queryParams })
      } catch (err) {
        expect(err).toBeTruthy()
      }
    })
    const formikProps: any = {
      values: {
        alertList: [
          {
            channelName: '',
            channelUrl: ''
          }
        ]
      }
    }

    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveListDocument) {
          return fromValue(PerspectiveList)
        }
        return fromValue({})
      }
    }

    const channelsData =
      selectedAlert.channels.map((item: any) => {
        return {
          channelName: item.notificationChannelType,
          channelUrl: item.channelUrls[0]
        }
      }) || []
    const { getByText } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <Dialog {...modalPropsLight} onClose={hideAnomaliesAlertModal}>
            <Formik
              initialValues={{
                perspective: 'perspectiveId',
                channelName: '',
                channelUrl: '',
                alertList: channelsData
              }}
              formName={'createNotificationAlert'}
              onSubmit={data => handleSubmit(data)}
              render={() => {
                return (
                  <FormikForm>
                    <StepWizard>
                      <AlertOverview name={''} onClose={hideAnomaliesAlertModal} items={[]} />
                      <NotificationMethod name={''} onClose={hideAnomaliesAlertModal} formikProps={formikProps} />
                    </StepWizard>
                  </FormikForm>
                )
              }}
            ></Formik>
          </Dialog>
        </Provider>
      </TestWrapper>
    )

    const modal = findDialogContainer()
    expect(modal).toBeDefined()
    expect(getByText('ce.anomalyDetection.notificationAlerts.selectPerspectiveLabel')).toBeDefined()

    const saveAndContinueBtn = getByText('saveAndContinue')
    act(() => {
      fireEvent.click(saveAndContinueBtn!)
    })
    expect(getByText('ce.anomalyDetection.notificationAlerts.notificationStepSubtext')).toBeDefined()

    const addChannelBtn = getByText('ce.anomalyDetection.notificationAlerts.addChannelBtn')
    expect(addChannelBtn).toBeDefined()
    act(() => {
      fireEvent.click(addChannelBtn!)
    })

    const deleteChannelIcon = modal?.querySelector('[data-testid="deleteChannel"]')
    expect(deleteChannelIcon).toBeDefined()
    act(() => {
      fireEvent.click(deleteChannelIcon!)
    })

    await act(async () => {
      clickSubmit(modal!)
    })
    expect(handleSubmit).toBeCalled()

    expect(modal).toMatchSnapshot()
  })

  test('Should be able to close the dialog on close', async () => {
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

    render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <Dialog {...modalPropsLight} onClose={hideAnomaliesAlertModal}>
            <Formik
              initialValues={{
                perspective: 'perspectiveId',
                channelName: '',
                channelUrl: '',
                alertList: []
              }}
              formName={'createNotificationAlert'}
              onSubmit={data => handleSubmit(data)}
              render={formikProps => {
                return (
                  <StepWizard>
                    <AlertOverview name={''} onClose={hideAnomaliesAlertModal} items={[]} />
                    <NotificationMethod name={''} onClose={hideAnomaliesAlertModal} formikProps={formikProps} />
                  </StepWizard>
                )
              }}
            ></Formik>
          </Dialog>
        </Provider>
      </TestWrapper>
    )

    const modal = findDialogContainer()
    expect(modal).toBeDefined()

    await waitFor(() => Promise.resolve())

    const crossIcon = modal?.querySelector('.closeBtn')
    act(() => {
      fireEvent.click(crossIcon!)
    })

    expect(hideAnomaliesAlertModal).toBeCalled()
  })
})
