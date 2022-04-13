/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/dom'
import { TestWrapper } from '@common/utils/testUtils'
import { useGitDiffEditorDialog } from '../useGitDiffEditorDialog'

const fetchRemoteFileContent = jest.fn()
jest.mock('services/cd-ng', () => ({
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: fetchRemoteFileContent }))
}))

const mockEntity = {
  pipeline: {
    stages: [
      {
        stage: {
          type: 'Deployment',
          spec: {
            serviceConfig: { serviceRef: 'service_2', serviceDefinition: { type: 'Kubernetes', spec: {} } },
            infrastructure: {
              infrastructureDefinition: {
                type: 'KubernetesDirect',
                spec: { releaseName: 'release-<+INFRA_KEY>', namespace: '<+input>', connectorRef: '<+input>' }
              },
              environmentRef: 'dev2',
              allowSimultaneousDeployments: false
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'K8sRollingDeploy',
                    timeout: '10m',
                    spec: { skipDryRun: false },
                    name: 'Rollout Deployment',
                    identifier: 'rolloutDeployment'
                  }
                }
              ],
              rollbackSteps: [
                {
                  step: {
                    type: 'K8sRollingRollback',
                    timeout: '10m',
                    name: 'Rollback Rollout Deployment',
                    identifier: 'rollbackRolloutDeployment',
                    spec: {}
                  }
                }
              ]
            }
          },
          name: 'stage 2',
          identifier: 'stage_2',
          failureStrategies: [{ onFailure: { errors: ['AllErrors'], action: { type: 'StageRollback' } } }]
        }
      }
    ],
    projectIdentifier: 'dev',
    orgIdentifier: 'dev_test',
    name: 'pipeline 24',
    identifier: 'pipeline_2',
    allowStageExecutions: false
  }
}

const mockGitDetails = {
  repoIdentifier: 'repo',
  rootFolder: '/src/.harness/',
  filePath: 'pipeline_2.yaml',
  commitMsg: 'Update pipeline pipeline 24',
  createPr: false,
  targetBranch: '',
  isNewBranch: false,
  branch: 'main',
  resolvedConflictCommitId: ''
}

describe('Test hook for correctness', () => {
  test('render useGitDiffEditorDialog hook', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useGitDiffEditorDialog({
          onClose: jest.fn(),
          onSuccess: jest.fn()
        }),
      { wrapper }
    )
    expect(Object.keys(result.current).indexOf('hideGitDiffDialog')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('openGitDiffDialog')).not.toBe(-1)
    await waitFor(() => {
      expect(result.current.openGitDiffDialog(mockEntity, mockGitDetails)).toBe(undefined)
      expect(fetchRemoteFileContent).toBeCalledTimes(1)
    })
  })
})
