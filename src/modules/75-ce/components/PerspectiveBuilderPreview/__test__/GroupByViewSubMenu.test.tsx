/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { ViewFieldIdentifier } from 'services/ce/services'
import GroupByViewSubMenu from '../GroupByView/GroupByViewSubMenu'

const props = {
  labelData: ['label1', 'label2', 'label3'],
  setGroupBy: jest.fn(),
  field: {
    identifier: ViewFieldIdentifier.Common,
    identifierName: 'Common',
    values: [
      {
        fieldId: 'region',
        fieldName: 'Region',
        identifier: ViewFieldIdentifier.Common,
        identifierName: 'Common'
      },
      {
        fieldId: 'label',
        fieldName: 'Label',
        identifier: ViewFieldIdentifier.Common,
        identifierName: 'Common'
      }
    ]
  }
}

describe('Group By View Submenu test cases', () => {
  test('should be able to render the component', async () => {
    const { container } = render(
      <TestWrapper>
        <GroupByViewSubMenu {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
