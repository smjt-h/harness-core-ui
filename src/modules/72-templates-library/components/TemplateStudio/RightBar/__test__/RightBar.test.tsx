/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import templateContextMock from '@templates-library/components/TemplateStudio/SaveTemplatePopover/_test_/stateMock'
import { RightBar } from '@templates-library/components/TemplateStudio/RightBar/RightBar'

jest.mock('@templates-library/components/TemplateStudio/RightDrawer/RightDrawer', () => ({
  ...(jest.requireActual('@templates-library/components/TemplateStudio/RightDrawer/RightDrawer') as any),
  RightDrawer: () => {
    return <div className="template-studio-right-drawer-mock"></div>
  }
}))

describe('RightBar', () => {
  test('renders correctly', () => {
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={templateContextMock}>
          <RightBar />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('clicking on Variables should open variables view in right drawer', async () => {
    const { getByText } = render(
      <TestWrapper>
        <TemplateContext.Provider value={templateContextMock}>
          <RightBar />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    const variableBtn = getByText('variablesText')
    act(() => {
      fireEvent.click(variableBtn)
    })
    await waitFor(() => expect(templateContextMock.updateTemplateView).toHaveBeenCalled())
    expect(templateContextMock.updateTemplateView).toHaveBeenCalledWith({
      drawerData: {
        type: 'TemplateVariables'
      },
      isDrawerOpened: true,
      isYamlEditable: false
    })
  })
})
