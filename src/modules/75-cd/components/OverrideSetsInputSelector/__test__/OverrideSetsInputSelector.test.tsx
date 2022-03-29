/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { findPopoverContainer } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { OverrideSetsInputSelector } from '../OverrideSetsInputSelector'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))
const InputSetSelectorProps = {
  value: [
    {
      label: 'demo',
      value: 'demoValue'
    },
    {
      label: 'demo1',
      value: 'demoValue1'
    }
  ],
  width: 350
}

const stageMock: StageElementWrapper<DeploymentStageElementConfig> = {
  stage: {
    spec: {
      execution: {
        rollbackSteps: undefined,
        steps: []
      },
      infrastructure: {
        allowSimultaneousDeployments: false,
        environment: undefined,
        environmentRef: 'environmentRef',
        infrastructureDefinition: undefined,
        infrastructureKey: 'infrastructureKey',
        useFromStage: undefined
      },
      serviceConfig: {
        service: undefined,
        serviceDefinition: {
          type: 'Kubernetes',
          spec: {
            artifacts: {
              sidecars: [
                {
                  sidecar: {
                    identifier: 'id11',
                    type: 'Gcr',
                    spec: {
                      connectorRef: 'gcp_connector',
                      registryHostname: 'gcr.io',
                      imagePath: 'library/nginx',
                      tag: '<+input>'
                    }
                  }
                },
                {
                  sidecar: {
                    identifier: 'id11',
                    type: 'DockerRegistry',
                    spec: {
                      connectorRef: 'harnessImage',
                      imagePath: 'library/nginx',
                      tag: '<+input>'
                    }
                  }
                }
              ],
              primary: {
                type: 'DockerRegistry',
                spec: { connectorRef: '<+input>', imagePath: '<+input>' }
              }
            },
            manifests: [],
            artifactOverrideSets: [
              {
                overrideSet: {
                  identifier: 'overrideSetIdentifier',
                  artifacts: {
                    sidecars: [],
                    primary: {
                      type: 'DockerRegistry',
                      spec: { connectorRef: '<+input>', imagePath: '<+input>' }
                    }
                  }
                }
              }
            ],
            manifestOverrideSets: [
              {
                overrideSet: {
                  identifier: 'overrideSetIdentifier'
                }
              }
            ],
            variableOverrideSets: [
              {
                overrideSet: {
                  identifier: 'overrideSetIdentifier'
                }
              }
            ]
          }
        },
        serviceRef: 'serviceRef',
        stageOverrides: {
          artifacts: undefined,
          manifests: undefined,
          variables: undefined,
          useArtifactOverrideSets: ['artifact1', 'artifact2'],
          useManifestOverrideSets: ['manifest1'],
          useVariableOverrideSets: ['variable1', 'variable2']
        },
        useFromStage: {
          stage: 'deploy'
        }
      }
    },
    identifier: 'identifier',
    name: 'name'
  }
}

const getContextValue = (): PipelineContextInterface => {
  return {
    ...stageMock,
    state: {
      selectionState: { selectedStageId: 'selectedID' }
    },
    getStageFromPipeline: jest.fn(() => {
      return { stage: stageMock, parent: undefined }
    })
  } as any
}

describe('OverrideSetsInputSelector ', () => {
  test('should render Artifact context', async () => {
    const { container, getByText, getByPlaceholderText } = render(
      <PipelineContext.Provider value={getContextValue()}>
        <OverrideSetsInputSelector context={'ARTIFACT'} onChange={jest.fn()} value={InputSetSelectorProps.value} />
      </PipelineContext.Provider>
    )
    fireEvent.click(container.querySelector('[data-icon="caret-down"]') as HTMLElement)
    const popover = findPopoverContainer()
    expect(popover).toMatchSnapshot()

    //checkbox Handler
    await act(async () => {
      const checkBoxOverride = fireEvent.click(getByText('overrideSetIdentifier'))
      fireEvent.click(document.querySelector('input[type=checkbox]') as HTMLElement)
      expect(checkBoxOverride).toBeTruthy()
    })

    // checkBox change
    fireEvent.click(document.querySelector('.item') as HTMLElement)
    const checkBoxDemo = fireEvent.click(getByText('demo'))
    expect(checkBoxDemo).toBeTruthy()

    //searchBox Change
    const searchBox = getByPlaceholderText('overrideSet.searchInputSet')
    expect(searchBox).not.toBe(null)
    act(() => {
      fireEvent.change(getByPlaceholderText('overrideSet.searchInputSet'), { target: { value: 'randomstring223' } })
    })
    expect(container).toMatchSnapshot()
  })
  test('should render Manifest context', () => {
    const { container } = render(
      <PipelineContext.Provider value={getContextValue()}>
        <OverrideSetsInputSelector context={'MANIFEST'} onChange={jest.fn()} value={InputSetSelectorProps.value} />
      </PipelineContext.Provider>
    )
    expect(container).toMatchSnapshot()
  })
  test('should render Variables context', () => {
    const { container } = render(
      <PipelineContext.Provider value={getContextValue()}>
        <OverrideSetsInputSelector context={'VARIABLES'} onChange={jest.fn()} value={InputSetSelectorProps.value} />
      </PipelineContext.Provider>
    )
    expect(container).toMatchSnapshot()
  })
  test('should render Artifact and value not array', async () => {
    const { container } = render(
      <OverrideSetsInputSelector
        context={'ARTIFACT'}
        onChange={jest.fn()}
        value={{ label: 'singleValue', value: 'demoSingle' }}
      />
    )
    fireEvent.click(container.querySelector('[data-icon="cross"]') as HTMLElement)
    expect(container).toMatchSnapshot()
  })
  test('should render Artifact no value', () => {
    const { container } = render(<OverrideSetsInputSelector context={'ARTIFACT'} onChange={jest.fn()} />)
    expect(container).toMatchSnapshot()
  })
})
