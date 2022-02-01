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

import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineStagesProps } from '@pipeline/components/PipelineStages/PipelineStages'

import pipelineContextProviderProps from './__tests__/mockJson/pipelineContextProvider.json'
import { getCDPipelineStages } from '@cd/components/PipelineStudio/CDPipelineStagesUtils'

export interface PipelineContextWrapperProps extends GitSyncTestWrapperProps {
  pipelineContextValues?: Partial<PipelineContextInterface>
}

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
            setSelection: jest.fn,
            renderPipelineStage: (
              args: Omit<PipelineStagesProps, 'children'>
            ): React.ReactElement<PipelineStagesProps> => {
              return getCDPipelineStages(args, jest.fn(), true, false, false, true)
            },
            setTemplateTypes: jest.fn(),
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
