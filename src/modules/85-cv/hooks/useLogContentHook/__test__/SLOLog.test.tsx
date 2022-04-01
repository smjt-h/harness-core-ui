/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { projectPathProps } from '@common/utils/routeUtils'
import SLOLog from '../views/SLOLog'
import { PAGE_SIZE } from '../views/ExecutionLog/ExecutionLog.constants'
import { LogTypes } from '../useLogContentHook.types'
import { executionLogsResponse, pathParams } from './ExecutionLog.mock'

const { accountId, orgIdentifier, projectIdentifier } = pathParams

export const testWrapperProps: TestWrapperProps = {
  path: routes.toCVSLOs({ ...projectPathProps }),
  pathParams: {
    accountId,
    orgIdentifier,
    projectIdentifier
  }
}

const fetchHealthSources = jest.fn()

jest.mock('services/cv', () => ({
  useGetServiceLevelObjectiveLogs: jest
    .fn()
    .mockImplementation(() => ({ data: executionLogsResponse, loading: false, error: null, refetch: jest.fn() })),
  useGetVerifyStepHealthSources: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: fetchHealthSources }))
}))

jest.mock('moment', () => () => ({
  format: () => 'DUMMY_DATE',
  utc: () => ({ startOf: () => ({ toDate: () => new Date('2022') }) }),
  subtract: () => ({ add: () => ({ utc: () => ({ startOf: () => ({ toDate: () => new Date('2022') }) }) }) })
}))

describe('SLOLog', () => {
  test('should render SLOLog component', () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <SLOLog
          identifier="SLO_IDENTIFIER"
          serviceName="SERVICE_NAME"
          envName="ENV_NAME"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.executionLogs')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should not call healthSource API for SLO', () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <SLOLog
          identifier="SLO_IDENTIFIER"
          serviceName="SERVICE_NAME"
          envName="ENV_NAME"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(fetchHealthSources).not.toHaveBeenCalled()
  })

  test('should handle the time range filter', async () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <SLOLog
          identifier="SLO_IDENTIFIER"
          serviceName="SERVICE_NAME"
          envName="ENV_NAME"
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.showingLogsFor cv.lastonehour from DUMMY_DATE to DUMMY_DATE.')).toBeInTheDocument()

    userEvent.click(screen.getByPlaceholderText('- Select -'))
    userEvent.click(screen.getByText('cv.monitoredServices.serviceHealth.last4Hrs'))

    expect(
      screen.getByText('cv.showingLogsFor cv.monitoredservices.servicehealth.last4hrs from DUMMY_DATE to DUMMY_DATE.')
    ).toBeInTheDocument()

    userEvent.click(screen.getByPlaceholderText('- Select -'))
    userEvent.click(screen.getByText('cv.last12Hours'))

    expect(screen.getByText('cv.showingLogsFor cv.last12hours from DUMMY_DATE to DUMMY_DATE.')).toBeInTheDocument()

    userEvent.click(screen.getByPlaceholderText('- Select -'))
    userEvent.click(screen.getByText('cv.monitoredServices.serviceHealth.last24Hrs'))

    expect(
      screen.getByText('cv.showingLogsFor cv.monitoredservices.servicehealth.last24hrs from DUMMY_DATE to DUMMY_DATE.')
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(cvService.useGetServiceLevelObjectiveLogs).toHaveBeenLastCalledWith({
        identifier: 'SLO_IDENTIFIER',
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          pageNumber: 0,
          logType: LogTypes.ExecutionLog,
          pageSize: PAGE_SIZE,
          errorLogsOnly: false,
          startTime: 1640995200000,
          endTime: 1640995200000
        }
      })
    })
  })
})
