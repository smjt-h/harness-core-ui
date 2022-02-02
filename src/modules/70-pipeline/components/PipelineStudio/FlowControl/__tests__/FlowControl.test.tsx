/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { RightDrawer } from '../../RightDrawer/RightDrawer'
import pipelineContextMock from '../../RightDrawer/__tests__/stateMock'
import { DrawerTypes } from '../../PipelineContext/PipelineActions'
import { Barrier, BarrierList, BarrierListProps } from '../FlowControl'
import { mockedPipeline } from '@cv/components/PipelineSteps/ContinousVerification/components/ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/MonitoredService/__tests__/MonitoredService.mock'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { act } from '@testing-library/react-hooks'

jest.mock('@blueprintjs/core', () => ({
  ...(jest.requireActual('@blueprintjs/core') as any),
  // eslint-disable-next-line react/display-name
  Drawer: ({ children, title }: any) => (
    <div className="drawer-mock">
      {title}
      {children}
    </div>
  )
}))

const barriersList: Array<Barrier> = [
  {
    name: 'Barrier 1',
    identifier: 'barrier1'
  }
]

const barrierListProps: BarrierListProps = {
  list: barriersList,
  pipeline: { ...mockedPipeline, flowControl: { barriers: barriersList } } as PipelineInfoConfig,
  createItem: jest.fn(),
  deleteItem: jest.fn(),
  commitItem: jest.fn(),
  updatePipeline: jest.fn(),
  getString: jest.fn(),
  loadingSetupInfo: false
}

describe('FlowControl tests', () => {
  test('should render fine', async () => {
    pipelineContextMock.stepsFactory.getStepData = () => undefined
    pipelineContextMock.state.pipelineView.drawerData.type = DrawerTypes.FlowControl
    pipelineContextMock.state.pipelineView?.drawerData?.data &&
      (pipelineContextMock.state.pipelineView.drawerData.data.paletteData = {
        isRollback: false,
        isParallelNodeClicked: false
      } as any)

    const { findByText, container } = render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper>
          <RightDrawer />
        </TestWrapper>
      </PipelineContext.Provider>
    )

    expect(container).toMatchSnapshot()
    const flowControlHeader = await findByText('pipeline.barriers.syncBarriers')
    expect(flowControlHeader).toBeInTheDocument()
    const addBarrierButton = await findByText('pipeline.barriers.addBarrier')
    expect(addBarrierButton).toBeInTheDocument()
  })
  test('barrier list is getting rendered', async () => {
    pipelineContextMock.stepsFactory.getStepData = () => undefined
    pipelineContextMock.state.pipelineView.drawerData.type = DrawerTypes.FlowControl
    pipelineContextMock.state.pipelineView?.drawerData?.data &&
      (pipelineContextMock.state.pipelineView.drawerData.data.paletteData = {
        isRollback: false,
        isParallelNodeClicked: false
      } as any)
    pipelineContextMock.state.pipeline.flowControl = { barriers: barriersList }

    const { findByText, getByText, container, getByTestId } = render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper>
          <BarrierList {...barrierListProps} />
        </TestWrapper>
      </PipelineContext.Provider>
    )
    expect(container).toBeDefined()
    expect(getByText('Barrier 1')).toBeInTheDocument()
    expect(getByText('barrier1')).toBeInTheDocument()
    const removeBarrierButton = getByTestId('remove-barrier-button')
    const addBarrierButton = await findByText('pipeline.barriers.addBarrier')
    expect(removeBarrierButton).toBeDefined()
    expect(addBarrierButton).toBeDefined()
    if (addBarrierButton) {
      act(() => {
        fireEvent.click(addBarrierButton)
      })
      expect(barrierListProps.createItem).toBeCalled()
    }

    if (removeBarrierButton) {
      act(() => {
        fireEvent.click(removeBarrierButton)
      })
      expect(barrierListProps.deleteItem).toBeCalled()
    }
  })
})
