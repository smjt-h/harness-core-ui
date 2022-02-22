/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { act } from 'react-test-renderer'
import { fireEvent, render, waitFor } from '@testing-library/react'
import {
  DynatraceHealthSourcePropsMock,
  DynatraceMockHealthSourceData,
  mockUseGetDynatraceServices
} from '@cv/pages/health-source/connectors/Dynatrace/__tests__/DynatraceHealthSource.mock'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import DynatraceHealthSource from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource'
import type { DynatraceHealthSourceProps } from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import * as cvService from 'services/cv'
import type { DynatraceMetricPacksToServiceProps } from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceMetricPacksToService/DynatraceMetricPacksToService.types'
import * as DynatraceCustomMetricsUtils from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics.utils'
import * as DynatraceHealthSourceUtils from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.utils'

import { SELECTED_AND_MAPPED_METRICS_WITH_DEFAULT_MOCK } from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/__tests__/DynatraceCustomMetrics.mock'
import type { FooterCTAProps } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

jest.mock('@cv/pages/health-source/common/DrawerFooter/DrawerFooter', () => (props: FooterCTAProps) => {
  useEffect(() => {
    props.onNext?.()
  }, [])
  return (
    <>
      <button
        data-testid={'triggerPreviousButtonMock'}
        onClick={() => {
          props.onPrevious?.()
        }}
      />
    </>
  )
})
const customMetricsComponentRenderMock = jest.fn()
jest.mock(
  '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics',
  () => () => {
    useEffect(() => {
      customMetricsComponentRenderMock()
    }, [])
    return <></>
  }
)

const dynatraceMetricPacksMappingRenderMock = jest.fn()
jest.mock(
  '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceMetricPacksToService/DynatraceMetricPacksToService',
  () => (props: DynatraceMetricPacksToServiceProps) => {
    useEffect(() => {
      dynatraceMetricPacksMappingRenderMock(props)
    }, [])
    return <></>
  }
)

function WrapperComponent(props: DynatraceHealthSourceProps): JSX.Element {
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
      <SetupSourceTabs data={DynatraceMockHealthSourceData} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <DynatraceHealthSource {...props} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('Validate DynatraceHealthSource', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(cvService, 'useGetDynatraceServices').mockReturnValue(mockUseGetDynatraceServices as any)
  })

  test('Should render custom metrics when Add metric link is clicked', async () => {
    const propsWithoutCustomMetrics = {
      ...DynatraceHealthSourcePropsMock,
      dynatraceFormData: { ...DynatraceHealthSourcePropsMock.dynatraceFormData, customMetrics: new Map() }
    }
    const initializeCreatedMetricsMock = jest.spyOn(DynatraceCustomMetricsUtils, 'initializeCreatedMetrics')

    const initializeSelectedMetricsMapMock = jest
      .spyOn(DynatraceCustomMetricsUtils, 'initializeSelectedMetricsMap')
      .mockReturnValue(SELECTED_AND_MAPPED_METRICS_WITH_DEFAULT_MOCK)
    const { getByText } = render(<WrapperComponent {...propsWithoutCustomMetrics} />)

    expect(initializeSelectedMetricsMapMock).toHaveBeenNthCalledWith(
      1,
      'cv.healthSource.connectors.Dynatrace.defaultMetricName',
      propsWithoutCustomMetrics.dynatraceFormData.customMetrics
    )

    expect(initializeCreatedMetricsMock).toHaveBeenNthCalledWith(
      1,
      'cv.healthSource.connectors.Dynatrace.defaultMetricName',
      SELECTED_AND_MAPPED_METRICS_WITH_DEFAULT_MOCK.selectedMetric,
      SELECTED_AND_MAPPED_METRICS_WITH_DEFAULT_MOCK.mappedMetrics
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.addMetric')).not.toBeNull())
    act(() => {
      fireEvent.click(getByText('cv.monitoringSources.addMetric'))
    })
    await waitFor(() => expect(customMetricsComponentRenderMock).toHaveBeenCalledTimes(1))
  })

  test('should render DynatraceMetricPacksToService', async () => {
    render(<WrapperComponent {...DynatraceHealthSourcePropsMock} />)
    expect(dynatraceMetricPacksMappingRenderMock).toHaveBeenCalledTimes(1)
  })

  test('should call onSubmitDynatraceData', async () => {
    const onSubmitDynatraceDataMock = jest.spyOn(DynatraceHealthSourceUtils, 'onSubmitDynatraceData')
    const { getByTestId } = render(<WrapperComponent {...DynatraceHealthSourcePropsMock} />)
    expect(onSubmitDynatraceDataMock).toHaveBeenCalledTimes(1)
    act(() => {
      fireEvent.click(getByTestId('triggerPreviousButtonMock'))
    })
  })
})
