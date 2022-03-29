/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, render, queryByText, act, queryAllByText } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import BusinessMappingList from '../BusinessMappingList'

const handleDelete = jest.fn()
const onEdit = jest.fn()

const props = {
  data: [
    {
      uuid: 'uuid',
      name: 'Region',
      accountId: 'accountID',
      costTargets: [
        {
          name: 'US',
          rules: [
            {
              viewConditions: [
                {
                  type: 'VIEW_ID_CONDITION',
                  viewField: {
                    fieldId: 'region',
                    fieldName: 'Region',
                    identifier: 'COMMON',
                    identifierName: 'Common'
                  },
                  viewOperator: 'IN',
                  values: ['US East', 'US Central']
                }
              ]
            }
          ]
        },
        {
          name: 'EU',
          rules: [
            {
              viewConditions: [
                {
                  type: 'VIEW_ID_CONDITION',
                  viewField: {
                    fieldId: 'region',
                    fieldName: 'Region',
                    identifier: 'COMMON',
                    identifierName: 'Common'
                  },
                  viewOperator: 'IN',
                  values: ['eu-west-1', 'eu-central-1', 'eu-west-2']
                }
              ]
            }
          ]
        }
      ],
      sharedCosts: null,
      unallocatedCost: null,
      createdAt: 1647496110478,
      lastUpdatedAt: 1647496110478,
      createdBy: null,
      lastUpdatedBy: null
    }
  ] as any,
  handleDelete: handleDelete,
  onEdit: onEdit
}

describe('Test Cases for Business Mapping List Page', () => {
  test('should be able to render the list', () => {
    const { container } = render(
      <TestWrapper>
        <BusinessMappingList {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should be able to render the list and trigger edit', () => {
    const { container } = render(
      <TestWrapper>
        <BusinessMappingList {...props} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(container.querySelector("[data-icon='Options']")!)
    })

    const editButton = queryByText(document.body, 'edit')

    act(() => {
      fireEvent.click(editButton!)
    })
    expect(onEdit).toBeCalled()
  })

  test('should be able to render the list and trigger edit', async () => {
    const { container } = render(
      <TestWrapper>
        <BusinessMappingList {...props} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(container.querySelector("[data-icon='Options']")!)
    })

    const deleteButton = queryByText(document.body, 'delete')

    act(() => {
      fireEvent.click(deleteButton!)
    })

    expect(queryByText(document.body, 'ce.businessMapping.confirmDialogHeading')).toBeInTheDocument()

    const confirmDelete = queryAllByText(document.body, 'delete')

    act(() => {
      fireEvent.click(confirmDelete[1]!)
    })
    expect(handleDelete).toBeCalled()
  })
})
