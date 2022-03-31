/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import NotificationMethod from '../NotificationMethod'

const params = {
  accountId: 'TEST_ACC'
}

// const arrayHelpers = {
//   push: jest.fn(),
//   remove: jest.fn()
// }

const props: any = {
  name: '',
  onClose: jest.fn(),
  previousStep: jest.fn(),
  nextStep: jest.fn(),
  formikProps: {
    values: {
      alertList: [
        {
          channelName: '',
          channelUrl: ''
        }
      ]
    },
    setFieldValue: jest.fn()
  }
}

describe('Test case for Anomalies alert notification method selection', () => {
  test('Should be able to load alert method selection screen', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <NotificationMethod {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Should be able to add new channel', async () => {
    const { getByText } = render(
      <TestWrapper pathParams={params}>
        <NotificationMethod {...props} />
      </TestWrapper>
    )

    const addChannelBtn = getByText('ce.anomalyDetection.notificationAlerts.addChannelBtn')
    expect(addChannelBtn).toBeDefined()

    // act(() => {
    //   fireEvent.click(addChannelBtn!)
    // })

    // await waitFor(() => {
    //   expect(arrayHelpers.push).toBeCalled()
    // })
  })

  test('Should be able to render 1st screen on back click', async () => {
    const { getByText } = render(
      <TestWrapper pathParams={params}>
        <NotificationMethod {...props} />
      </TestWrapper>
    )

    const backBtn = getByText('back')
    expect(backBtn).toBeDefined()
    act(() => {
      fireEvent.click(backBtn!)
    })

    await waitFor(() => {
      expect(props.previousStep).toBeCalledWith({ name: props.name })
    })
  })

  test('Should be able to delete row on delete icon click', async () => {
    // const removeRow = jest.fn()
    const { container } = render(
      <TestWrapper pathParams={params}>
        <NotificationMethod {...props} />
      </TestWrapper>
    )

    const deleteIcon = container.querySelector('[data-testid="deleteChannel"]')
    expect(deleteIcon).toBeDefined()

    // act(() => {
    //   fireEvent.click(deleteIcon!)
    // })

    // await waitFor(() => {
    //   expect(removeRow).toBeCalled()
    // })
  })

  test('Should be able to close the modal on click of close button', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <NotificationMethod {...props} />
      </TestWrapper>
    )

    const crossIcon = container.querySelector('[data-testid="crossModal"]')
    expect(crossIcon).toBeDefined()
    act(() => {
      fireEvent.click(crossIcon!)
    })

    await waitFor(() => {
      expect(props.onClose).toBeCalled()
    })
  })

  test('should be able to submit the form', async () => {
    const { getByText } = render(
      <TestWrapper pathParams={params}>
        <NotificationMethod {...props} />
      </TestWrapper>
    )

    const continueBtn = getByText('saveAndContinue')
    expect(continueBtn).toBeDefined()
    act(() => {
      fireEvent.click(continueBtn!)
    })

    await waitFor(() => {
      expect(props.nextStep).toBeCalledWith({ name: props.name })
    })
  })
})
