/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { act } from 'react-test-renderer'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import {
  DynatraceMockHealthSourceData,
  DynatraceUpdatedHealthSourceMock,
  MockDynatraceMetricData
} from '@cv/pages/health-source/connectors/Dynatrace/__tests__/DynatraceHealthSource.mock'

import DynatraceHealthSourceContainer from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSourceContainer'
import type {
  DynatraceHealthSourceContainerProps,
  DynatraceHealthSourceProps
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import * as DynatraceUtils from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.utils'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest
    .fn()
    .mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn(), clear: jest.fn() } }),
  CVObjectStoreNames: {}
}))

const mockDynatraceHealthSourcePropsValidation = jest.fn()
jest.mock(
  '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource',
  () => (props: DynatraceHealthSourceProps) => {
    useEffect(() => {
      mockDynatraceHealthSourcePropsValidation(props)
    }, [])
    return (
      <>
        <button
          data-testid={'triggerSubmitButtonMock'}
          onClick={() => {
            props.onSubmit(MockDynatraceMetricData)
          }}
        />
        <button
          data-testid={'triggerPreviousButtonMock'}
          onClick={() => {
            props.onPrevious()
          }}
        />
      </>
    )
  }
)

function WrapperComponent(props: DynatraceHealthSourceContainerProps): JSX.Element {
  return (
    <TestWrapper
      path={routes.toCVActivitySourceEditSetup({
        ...accountPathProps,
        ...projectPathProps
      })}
      pathParams={{
        accountId: projectPathProps.accountId,
        projectIdentifier: projectPathProps.projectIdentifier,
        orgIdentifier: projectPathProps.orgIdentifier,
        activitySource: '1234_activitySource',
        activitySourceId: '1234_sourceId'
      }}
    >
      <SetupSourceTabs data={props} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <DynatraceHealthSourceContainer {...props} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('Validate DynatraceHealthSourceContainer', () => {
  test('should validate that proper DynatraceMetricData is passed to child component', async () => {
    jest.spyOn(DynatraceUtils, 'mapHealthSourceToDynatraceMetricData').mockReturnValue('mockDynatraceData' as any)
    const onSubmitMock = jest.fn()
    render(
      <WrapperComponent data={{ ...DynatraceMockHealthSourceData, connectorRef: undefined }} onSubmit={onSubmitMock} />
    )
    expect(mockDynatraceHealthSourcePropsValidation).toHaveBeenNthCalledWith(1, {
      dynatraceFormData: 'mockDynatraceData',
      onSubmit: expect.anything(),
      onPrevious: expect.anything(),
      connectorIdentifier: ''
    })
  })

  test('should validate handleSubmit is called', async () => {
    const onSubmitMock = jest.fn()
    const mapDynatraceMetricDataToHealthSourceMock = jest
      .spyOn(DynatraceUtils, 'mapDynatraceMetricDataToHealthSource')
      .mockReturnValue(DynatraceUpdatedHealthSourceMock)
    const { getByTestId } = render(<WrapperComponent data={DynatraceMockHealthSourceData} onSubmit={onSubmitMock} />)

    act(() => {
      fireEvent.click(getByTestId('triggerSubmitButtonMock'))
    })

    await waitFor(() => {
      expect(mapDynatraceMetricDataToHealthSourceMock).toHaveBeenCalledTimes(1)
      expect(onSubmitMock).toHaveBeenNthCalledWith(1, DynatraceMockHealthSourceData, DynatraceUpdatedHealthSourceMock)
    })

    act(() => {
      fireEvent.click(getByTestId('triggerPreviousButtonMock'))
    })
  })
})
