/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { HealthSource, HealthSourceSpec, MonitoredServiceDTO } from 'services/cv'
import VerifyStepHealthSourceTable from '../VerifyStepHealthSourceTable'
import { tableData } from './HealthSourceTable.mock'
import { mockedMonitoredService } from './VerifyStepHealthSourceTable.mock'
import { deleteHealthSourceVerifyStep } from '../VerifyStepHealthSourceTable.utils'
import type { RowData } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'

describe('Verify VerifyStepHealthSourceTable', () => {
  const onSuccess = jest.fn()
  const props = {
    serviceIdentifier: 'service101',
    envIdentifier: 'env101',
    healthSourcesList: tableData as any,
    monitoredServiceRef: { identifier: 'ms101', name: 'ms 101' },
    onSuccess: onSuccess,
    isRunTimeInput: false,
    changeSourcesList: [],
    monitoredServiceData: mockedMonitoredService as MonitoredServiceDTO
  }

  test('should render with isRunTimeInput false', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <VerifyStepHealthSourceTable {...props} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('plusAdd')).toBeTruthy())
    expect(container).toMatchSnapshot()
  })

  test('should render with isRunTimeInput true', async () => {
    const updatedProps = { ...props, isRunTimeInput: true }
    const { container } = render(
      <TestWrapper>
        <VerifyStepHealthSourceTable {...updatedProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should delete the healthcource correctly and return the updated Monitored service', async () => {
    const healthSourcesList = [
      {
        name: 'NR1',
        identifier: 'NR1',
        type: 'NewRelic',
        spec: {
          connectorRef: 'account.new_relic',
          applicationName: 'My Application',
          applicationId: '107019083',
          feature: 'apm',
          metricPacks: [
            {
              identifier: 'Performance'
            }
          ],
          newRelicMetricDefinitions: []
        } as HealthSourceSpec
      }
    ] as RowData[]

    const monitoredServiceData = mockedMonitoredService as MonitoredServiceDTO
    const rowToDelete = {
      name: 'NR1',
      identifier: 'NR1',
      type: 'NewRelic',
      spec: {
        connectorRef: 'account.new_relic',
        applicationName: 'My Application',
        applicationId: '107019083',
        feature: 'apm',
        metricPacks: [
          {
            identifier: 'Performance'
          }
        ],
        newRelicMetricDefinitions: []
      }
    } as HealthSource
    const updatedMonitoredServicePayload = {
      orgIdentifier: 'default',
      projectIdentifier: 'Harshil_project_service_reliability',
      identifier: 'service1_env1',
      name: 'service1_env1',
      type: 'Application',
      description: '',
      serviceRef: 'service1',
      environmentRef: 'env1',
      environmentRefList: [],
      tags: {},
      sources: {
        healthSources: [],
        changeSources: [
          {
            name: 'Harness CD Next Gen',
            identifier: 'harness_cd_next_gen',
            type: 'HarnessCDNextGen',
            enabled: true,
            spec: {},
            category: 'Deployment'
          }
        ]
      },
      dependencies: []
    }
    expect(deleteHealthSourceVerifyStep(healthSourcesList, monitoredServiceData, rowToDelete)).toEqual(
      updatedMonitoredServicePayload
    )
  })
})
