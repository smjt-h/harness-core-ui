/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as lwServices from 'services/lw'
import type { Service } from 'services/lw'
import FixedScheduleAccordion from '../FixedScheduleAccordion'

const mockedStaticSchedules = [
  {
    id: 54,
    name: 'sched1',
    account_id: 'kmpySmUISimoRrJL6NL73w',
    created_by: 'lv0euRhKRCyiXWzS7pOg6g',
    details: {
      uptime: {
        period: {
          start: '2022-02-21T11:00:00+05:30',
          end: '2022-02-22T12:00:00+05:30'
        },
        days: {
          days: [0, 1, 2, 3, 4, 5, 6],
          all_day: true,
          start_time: null,
          end_time: null
        }
      },
      downtime: null,
      timezone: 'Asia/Calcutta'
    },
    description: 'Uptime, All day on Sun,Mon,Tue,Wed,Thu,Fri,Sat',
    resources: [
      {
        ID: '495',
        Type: 'autostop_rule'
      }
    ],
    created_at: '2022-02-21T17:38:56.395834Z',
    updated_at: '2022-02-21T17:38:56.395834Z'
  },
  {
    id: 55,
    name: 'sched2',
    account_id: 'kmpySmUISimoRrJL6NL73w',
    created_by: 'lv0euRhKRCyiXWzS7pOg6g',
    details: {
      uptime: null,
      downtime: {
        period: {
          start: '2022-02-23T00:00:00+05:30',
          end: '2036-04-24T00:00:00+05:30'
        },
        days: {
          days: [0, 1, 2, 3, 4, 5, 6],
          all_day: true,
          start_time: null,
          end_time: null
        }
      },
      timezone: 'Asia/Calcutta'
    },
    description: 'Downtime, All day on Sun,Mon,Tue,Wed,Thu,Fri,Sat',
    resources: [
      {
        ID: '495',
        Type: 'autostop_rule'
      }
    ],
    created_at: '2022-02-21T17:38:57.853004Z',
    updated_at: '2022-02-21T17:38:57.853004Z'
  }
]

const mockedServiceData: Service = {
  id: 123,
  name: '',
  status: 'stopped',
  cloud_account_id: 'cloud_id',
  kind: '',
  org_id: 'org_id'
}

jest.mock('services/lw', () => ({
  useListStaticSchedules: jest.fn().mockImplementation(() => ({
    data: { response: mockedStaticSchedules },
    loading: false,
    refetch: jest.fn()
  })),
  useDeleteStaticSchedule: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(() => Promise.resolve())
  })),
  useCreateStaticSchedules: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(() => Promise.resolve())
  })),
  useValidateStaticScheduleList: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(() => Promise.resolve())
  }))
}))

describe('Fixed schedules accordion tests', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('render schedule accordion with 2 schedules', () => {
    const { container } = render(
      <TestWrapper>
        <FixedScheduleAccordion service={mockedServiceData} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('clicking on edit icon should open fixed schedule form modal', () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <FixedScheduleAccordion service={mockedServiceData} />
      </TestWrapper>
    )

    const btn = getByTestId('fixedSchedules-summary')
    expect(btn).toMatchSnapshot()
    fireEvent.click(btn)

    const editIcon = container.querySelector('span[data-icon="Edit"]')
    expect(editIcon).toBeDefined()
    act(() => {
      fireEvent.click(editIcon!)
    })
    const modal = document.querySelector('.bp3-dialog')
    expect(modal).toBeInTheDocument()
  })

  test('clicking on delete icon should open delete confirm modal', () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <FixedScheduleAccordion service={mockedServiceData} />
      </TestWrapper>
    )

    const btn = getByTestId('fixedSchedules-summary')
    expect(btn).toMatchSnapshot()
    fireEvent.click(btn)

    const deleteIcon = container.querySelector('span[data-icon="main-trash"]')
    expect(deleteIcon).toBeDefined()
    act(() => {
      fireEvent.click(deleteIcon!)
    })
    const modal = document.querySelector('.bp3-dialog')
    expect(modal).toBeInTheDocument()
  })

  test('render schedule accordion with 1 schedule', () => {
    jest.spyOn(lwServices, 'useListStaticSchedules').mockImplementation(
      () =>
        ({
          data: { response: [{ ...mockedStaticSchedules[0] }] },
          loading: false,
          refetch: jest.fn()
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <FixedScheduleAccordion service={mockedServiceData} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render schedule accordion with 0 schedules', () => {
    jest.spyOn(lwServices, 'useListStaticSchedules').mockImplementation(
      () =>
        ({
          data: { response: null },
          loading: false,
          refetch: jest.fn()
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <FixedScheduleAccordion service={mockedServiceData} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render schedule accordion while schedules are loading', () => {
    jest.spyOn(lwServices, 'useListStaticSchedules').mockImplementation(
      () =>
        ({
          data: { response: null },
          loading: true,
          refetch: jest.fn()
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <FixedScheduleAccordion service={mockedServiceData} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
