/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceCenterHome } from '@resource-center/components/ResourceCenter/ResourceCenter'
describe('ResourceCenter', () => {
  const dummy = jest.fn().mockImplementation()
  test('Should render resource center properly', () => {
    const { container } = render(
      <TestWrapper>
        <ResourceCenterHome onClose={dummy} submitTicket={dummy} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
