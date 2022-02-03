/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route } from 'react-router-dom'

import { pick } from 'lodash-es'

import { GitSyncTestWrapper, GitSyncTestWrapperProps } from '@common/utils/gitSyncTestUtils'
import { gitConfigs } from '@connectors/mocks/mock'

import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineStagesProps } from '@pipeline/components/PipelineStages/PipelineStages'
import { GetSchemaYaml } from '@pipeline/pages/triggers/__tests__/webhookMockResponses'
import {
  PipelineResponse,
  StepsResponse,
  ExecutionResponse,
  YamlResponse
} from '@pipeline/components/PipelineStudio/__tests__/PipelineStudioMocks'

import connectorListJSON from './__tests__/mockJson/connectorList.json'
import pipelineContextProviderProps from './__tests__/mockJson/pipelineContextProvider.json'
import serviceListJSON from './__tests__/mockJson/serviceList.json'
import stepListJSON from './__tests__/mockJson/stepList.json'
import variablesJSON from './__tests__/mockJson/variables.json'

export interface PipelineContextWrapperProps extends GitSyncTestWrapperProps {
  pipelineContextValues?: Partial<PipelineContextInterface>
}

jest.mock('@pipeline/utils/useTemplateSelector', () => ({
  useTemplateSelector: () => ({
    openTemplateSelector: jest.fn(),
    closeTemplateSelector: jest.fn()
  })
}))

const identifyMock = jest.fn()
const trackMock = jest.fn()
const pageMock = jest.fn()
jest.mock('@common/hooks/useTelemetryInstance', () => {
  return {
    useTelemetryInstance: () => {
      return {
        identify: identifyMock,
        track: trackMock,
        page: pageMock
      }
    }
  }
})

jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn(() => ({}))
}))

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({
    loading: false,
    data: connectorListJSON,
    mutate: jest.fn().mockImplementation(() => ({ loading: false, data: connectorListJSON })),
    refetch: jest.fn()
  })),
  useGetConnectorList: jest.fn(() => ({ loading: false, refetch: jest.fn(), data: undefined })),
  useGetConnector: jest.fn(() => ({ loading: false, refetch: jest.fn(), data: undefined })),
  useGetTestConnectionResult: jest.fn(() => ({ mutate: jest.fn() })),
  useGetTestGitRepoConnectionResult: jest.fn(() => ({ mutate: jest.fn() })),
  useGetSteps: jest.fn(() => ({ loading: false, refetch: jest.fn(), data: StepsResponse })),
  useGetExecutionStrategyList: jest.fn(() => ({ loading: false, data: ExecutionResponse })),
  useGetExecutionStrategyYaml: jest.fn(() => ({ loading: false, data: YamlResponse })),
  useGetServiceList: jest.fn().mockImplementation(() => ({
    loading: false,
    data: serviceListJSON,
    mutate: jest.fn().mockImplementation(() => ({ loading: false, data: serviceListJSON })),
    refetch: jest.fn()
  })),
  useGetEnvironmentListForProject: jest.fn(() => ({ loading: false, data: null, refetch: jest.fn() })),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: jest.fn() }
  }),
  useGetStepsV2: jest.fn().mockImplementation(() => ({
    loading: false,
    data: stepListJSON,
    mutate: jest.fn().mockImplementation(() => ({ loading: false, data: stepListJSON })),
    refetch: jest.fn()
  }))
}))

jest.mock('services/pipeline-ng', () => ({
  useGetYamlSchema: jest.fn(() => ({
    data: GetSchemaYaml as unknown as any,
    refetch: jest.fn(),
    error: null,
    loading: false,
    absolutePath: '',
    cancel: jest.fn(),
    response: null
  })),
  getPipelinePromise: jest.fn(() => Promise.resolve(PipelineResponse)),
  useGetSteps: jest.fn(() => ({ loading: false, refetch: jest.fn(), data: StepsResponse })),
  useCreateVariables: jest.fn(() => ({ mutate: jest.fn(), data: variablesJSON, loading: false, cancel: jest.fn() }))
}))

export const PipelineContextTestWrapper: React.FC<PipelineContextWrapperProps> = props => {
  const { defaultAppStoreValues, pipelineContextValues } = props
  return (
    <GitSyncTestWrapper
      {...pick(props, ['path', 'pathParams', 'queryParams'])}
      defaultAppStoreValues={{
        featureFlags: {},
        selectedProject: {
          identifier: 'dummy',
          name: 'dummy',
          modules: ['CD']
        },
        isGitSyncEnabled: true,
        connectivityMode: 'DELEGATE',
        ...defaultAppStoreValues
      }}
    >
      <PipelineContext.Provider
        value={
          {
            fetchPipeline: jest.fn,
            getStageFromPipeline: jest.fn,
            getStagePathFromPipeline: jest.fn,
            setSelection: jest.fn,
            setTemplateTypes: jest.fn,
            updatePipeline: jest.fn,
            updatePipelineView: jest.fn,
            renderPipelineStage: (
              args: Omit<PipelineStagesProps, 'children'>
            ): React.ReactElement<PipelineStagesProps> => {
              return React.createElement('div', { ...(args as any) })
              // getCDPipelineStages(args, jest.fn(), true, true, true, true)
            },
            ...pipelineContextProviderProps,
            ...pipelineContextValues,
            state: {
              ...pipelineContextProviderProps.state,
              ...pipelineContextValues?.state
            }
          } as PipelineContextInterface
        }
      >
        <Route exact path={props.path}>
          {props.children}
        </Route>
      </PipelineContext.Provider>
    </GitSyncTestWrapper>
  )
}
