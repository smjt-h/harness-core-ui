/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { cloneDeep } from 'lodash-es'
import * as cvService from 'services/cv'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { sourceData } from './CustomHealthLogSource.mocks'
import CustomHealthLogSource from '../CustomHealthLogSource'
import { CustomHealthLogFieldNames } from '../CustomHealthLogSource.constants'

jest.mock('@cv/components/MultiItemsSideNav/MultiItemsSideNav', () => ({
  ...(jest.requireActual('services/portal') as any),
  MultiItemsSideNav: function MockComponent(props: any) {
    return (
      <div>
        {props.createdMetrics.map((c: string) => (
          <p key={c} className={`created-metric-${c === props.defaultSelectedMetric ? 'isSelected' : ''}`}>
            {c}
          </p>
        ))}
        <button
          className="removeMetric"
          onClick={() => props.onRemoveMetric('customLog', 'asd', ['customLog5', 'customLog_2'], 1)}
        />
        <button
          className="selectMetric"
          onClick={() => props.onSelectMetric('customLog_2', ['customLog', 'customLog5', 'customLog_2'], 2)}
        />
      </div>
    )
  }
}))

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({
    isInitializingDB: false,
    dbInstance: {
      put: jest.fn(),
      get: jest.fn().mockReturnValue(undefined)
    }
  }),
  CVObjectStoreNames: {}
}))

jest.mock('../../CustomHealthSource/components/QueryMapping/QueryMapping', () => () => <div />)

describe('Unit tests for customhealthlogsource', () => {
  test('Ensure panels are rendered correctly and delete query works', async () => {
    jest.spyOn(cvService, 'useFetchSampleData').mockReturnValue({ data: { data: [] } } as any)
    const { container, getByText } = render(
      <TestWrapper>
        <SetupSourceTabs data={{}} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
          <CustomHealthLogSource data={cloneDeep(sourceData)} onSubmit={jest.fn()} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() =>
      expect(getByText('cv.monitoringSources.prometheus.querySpecificationsAndMappings')).not.toBeNull()
    )
    fireEvent.click(container.querySelector('.removeMetric')!)
    await waitFor(() => expect(container.querySelectorAll('[class*="created-metric"]').length).toBe(2))
  })

  test('Ensure panels are rendered correctly and select query works', async () => {
    jest.spyOn(cvService, 'useFetchSampleData').mockReturnValue({ data: { data: [] } } as any)
    const { container, getByText } = render(
      <TestWrapper>
        <SetupSourceTabs data={{}} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
          <CustomHealthLogSource data={cloneDeep(sourceData)} onSubmit={jest.fn()} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() =>
      expect(getByText('cv.monitoringSources.prometheus.querySpecificationsAndMappings')).not.toBeNull()
    )
    fireEvent.click(container.querySelector('[class*="selectMetric"]')!)
    await waitFor(() => expect(container.querySelector('p[class*="isSelected"]')?.innerHTML).toEqual('customLog_2'))
  })

  test('Ensure that changing the queery name is done correctly', async () => {
    const submitMock = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <SetupSourceTabs data={{}} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
          <CustomHealthLogSource data={cloneDeep(sourceData)} onSubmit={submitMock} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() =>
      expect(getByText('cv.monitoringSources.prometheus.querySpecificationsAndMappings')).not.toBeNull()
    )

    const newQueryName = 'customLooooog'
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: CustomHealthLogFieldNames.QUERY_NAME,
      value: newQueryName
    })

    fireEvent.click(getByText('submit'))
    await waitFor(() => expect(submitMock).toHaveBeenCalled())
  })

  test('ensure submit works correctly', async () => {
    jest.spyOn(cvService, 'useFetchSampleData').mockReturnValue({ data: { data: [] } } as any)
    const submitMock = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <SetupSourceTabs data={{}} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
          <CustomHealthLogSource data={cloneDeep(sourceData)} onSubmit={submitMock} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() =>
      expect(getByText('cv.monitoringSources.prometheus.querySpecificationsAndMappings')).not.toBeNull()
    )
    fireEvent.click(getByText('submit'))
    await waitFor(() => expect(submitMock).toHaveBeenCalled())
  })

  test('Ensure panels are rendered correctly and delete query works with renamed metric', async () => {
    jest.spyOn(cvService, 'useFetchSampleData').mockReturnValue({ data: { data: [] } } as any)
    const clonedData = cloneDeep(sourceData)
    clonedData.healthSourceList[0].spec.logDefinitions[0].queryName = 'solo-dolo'
    const { container, getByText } = render(
      <TestWrapper>
        <SetupSourceTabs data={{}} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
          <CustomHealthLogSource data={clonedData} onSubmit={jest.fn()} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() =>
      expect(getByText('cv.monitoringSources.prometheus.querySpecificationsAndMappings')).not.toBeNull()
    )
    fireEvent.click(container.querySelector('.removeMetric')!)
    await waitFor(() => expect(container.querySelectorAll('[class*="created-metric"]').length).toBe(2))
  })
})
