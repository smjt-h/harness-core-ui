/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import CVSLODetailsPage from '../CVSLODetailsPage'
import { responseSLODashboardDetail, testWrapperProps } from './CVSLODetailsPage.mock'

jest.mock('@cv/pages/slos/components/CVCreateSLO/CVCreateSLO', () => ({
  __esModule: true,
  default: function CVCreateSLO() {
    return <div>MOCKED - CVCreateSLO</div>
  }
}))

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper {...testWrapperProps}>
      <CVSLODetailsPage />
    </TestWrapper>
  )
}

describe('Test cases for CVSLODetailsPage', () => {
  test('it should render the component and take a snapshot', () => {
    jest
      .spyOn(cvServices, 'useGetSLODetails')
      .mockReturnValue({ data: responseSLODashboardDetail, loading: false } as any)

    const { container } = renderComponent()

    expect(container).toMatchSnapshot()
  })

  test('it should handle the loading state', () => {
    jest.spyOn(cvServices, 'useGetSLODetails').mockReturnValue({ data: null, loading: true } as any)

    const { container } = renderComponent()

    expect(container.getElementsByClassName('bp3-skeleton')).toHaveLength(2)
  })
})
