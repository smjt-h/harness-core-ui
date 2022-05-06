/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { Scope } from '@common/interfaces/SecretsInterface'
import { RightBar } from '../RightBar'
import { PipelineContext, PipelineContextInterface } from '../../PipelineContext/PipelineContext'

jest.mock('services/cd-ng', () => ({
  getConnectorPromise: () => Promise.resolve(connectorMock),
  useGetConnector: () => ({
    loading: false,
    data: connectorMock,
    refetch: jest.fn()
  })
}))

jest.mock('../../RightDrawer/RightDrawer', () => ({
  RightDrawer: () => <div />
}))

const connectorMock = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'test-connector',
      identifier: 'test_connector',
      description: '',
      orgIdentifier: 'default',
      projectIdentifier: 'projectIdentifier',
      tags: {},
      type: 'Github',
      spec: {
        url: 'https://github.com/',
        validationRepo: 'devrepo',
        authentication: {
          type: 'Http',
          spec: {
            type: 'UsernameToken',
            spec: {
              username: 'username',
              usernameRef: null,
              tokenRef: 'tokenRef'
            }
          }
        },
        type: 'Account'
      }
    }
  }
}

const stateMock = {
  pipeline: {
    name: 'P1',
    identifier: 'P1',
    projectIdentifier: 'Milos2',
    orgIdentifier: 'CV',
    tags: {},
    properties: {
      ci: {
        codebase: {
          connectorRef: 'Git5',
          build: '<+input>'
        }
      }
    },
    stages: [
      {
        stage: {
          name: 'S1',
          identifier: 'S1',
          description: '',
          type: 'CI',
          spec: {
            cloneCodebase: true,
            execution: {
              steps: []
            },
            serviceDependencies: []
          }
        }
      }
    ]
  },
  originalPipeline: {
    name: 'P1',
    identifier: 'P1',
    projectIdentifier: 'Milos2',
    orgIdentifier: 'CV',
    tags: {}
  },
  pipelineIdentifier: '-1',
  pipelineView: {
    isSplitViewOpen: true,
    isDrawerOpened: false,
    splitViewData: {
      type: 'StageView'
    },
    drawerData: {
      type: 'AddCommand'
    }
  },
  gitDetail: {},
  isLoading: false,
  isBEPipelineUpdated: false,
  isDBInitialized: true,
  isUpdated: true,
  isInitialized: true,
  selectionState: {
    selectedStageId: 'S1'
  },
  error: ''
}

export const pipelineContext: PipelineContextInterface = {
  updatePipeline: jest.fn(),
  state: stateMock as any,
  contextType: 'Pipeline',
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  stepsFactory: factory,
  stagesMap: {},
  isReadonly: false,
  setSchemaErrorView: jest.fn(),
  view: 'ui',
  scope: Scope.PROJECT,
  renderPipelineStage: jest.fn(),
  setView: jest.fn(),
  updateGitDetails: jest.fn(),
  updateEntityValidityDetails: jest.fn(),
  updatePipelineView: jest.fn(),
  updateTemplateView: jest.fn(),
  fetchPipeline: jest.fn(),
  deletePipelineCache: jest.fn(),
  getStageFromPipeline: jest.fn(),
  setYamlHandler: jest.fn(),
  runPipeline: jest.fn(),
  updateStage: jest.fn(),
  pipelineSaved: jest.fn(),
  setSelectedStageId: jest.fn(),
  setSelectedStepId: jest.fn(),
  setSelectedSectionId: jest.fn(),
  setSelection: jest.fn(),
  getStagePathFromPipeline: jest.fn(),
  setTemplateTypes: jest.fn()
}

describe('RightBar', () => {
  test('renders correctly', () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContext}>
          <RightBar />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('clicking on Variables should open variables view in right drawer', async () => {
    const { getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContext}>
          <RightBar />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const variableBtn = getByText('common.variables')
    act(() => {
      fireEvent.click(variableBtn)
    })
    await waitFor(() => expect(pipelineContext.updatePipelineView).toHaveBeenCalled())
    expect(pipelineContext.updatePipelineView).toHaveBeenCalledWith({
      drawerData: {
        type: 'PipelineVariables'
      },
      isDrawerOpened: true,
      isSplitViewOpen: false,
      splitViewData: {}
    })
  })

  test('clicking on Notifications should open notifications table in right drawer', async () => {
    const { getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContext}>
          <RightBar />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const notificationsBtn = getByText('notifications.pipelineName')
    act(() => {
      fireEvent.click(notificationsBtn)
    })
    await waitFor(() => expect(pipelineContext.updatePipelineView).toHaveBeenCalled())
    expect(pipelineContext.updatePipelineView).toHaveBeenCalledWith({
      drawerData: {
        type: 'PipelineNotifications'
      },
      isDrawerOpened: true,
      isSplitViewOpen: false,
      splitViewData: {}
    })
  })

  test('clicking on Flow Control should open Flow Control view in right drawer', async () => {
    const { getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContext}>
          <RightBar />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const flowControlBtn = getByText('pipeline.barriers.flowControl')
    act(() => {
      fireEvent.click(flowControlBtn)
    })
    await waitFor(() => expect(pipelineContext.updatePipelineView).toHaveBeenCalled())
    expect(pipelineContext.updatePipelineView).toHaveBeenCalledWith({
      drawerData: {
        type: 'FlowControl'
      },
      isDrawerOpened: true,
      isSplitViewOpen: false,
      splitViewData: {}
    })
  })

  test('clicking on Codebase Configuration should open Codebase Configuration view in right drawer', async () => {
    const { getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContext}>
          <RightBar />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const codebaseConfigurationBtn = getByText('codebase')
    act(() => {
      fireEvent.click(codebaseConfigurationBtn)
    })
    await waitFor(() => expect(pipelineContext.updatePipelineView).toHaveBeenCalled())
    expect(pipelineContext.updatePipelineView).toHaveBeenCalledWith({
      drawerData: {
        type: 'AddCommand'
      },
      isDrawerOpened: false,
      isSplitViewOpen: false,
      splitViewData: {}
    })
  })

  test('clicking on Advanced Options should open Advanced Options view in right drawer', async () => {
    const { getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContext}>
          <RightBar />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const advancedOptionsBtn = getByText('pipeline.advancedOptions')
    act(() => {
      fireEvent.click(advancedOptionsBtn)
    })
    await waitFor(() => expect(pipelineContext.updatePipelineView).toHaveBeenCalled())
    expect(pipelineContext.updatePipelineView).toHaveBeenCalledWith({
      drawerData: {
        type: 'AdvancedOptions'
      },
      isDrawerOpened: true,
      isSplitViewOpen: false,
      splitViewData: {}
    })
  })
})
