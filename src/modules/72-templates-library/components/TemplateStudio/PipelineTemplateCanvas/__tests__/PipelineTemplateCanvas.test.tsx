/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import produce from 'immer'
import { set } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { DrawerTypes as TemplateDrawerTypes } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateActions'
import { PipelineTemplateCanvasWithRef } from '../PipelineTemplateCanvas'

jest.mock('@pipeline/components/PipelineStudio/StageBuilder/StageBuilder', () => () => {
  const {
    state: { pipeline },
    updatePipeline
  } = usePipelineContext()
  return (
    <div className="stage-builder-mock">
      <button
        onClick={() => {
          const updatedPipeline = produce(pipeline, draft => {
            set(draft, 'stages[0].stage.spec.serviceConfig.serviceRef', 'Pipeline')
          })
          updatePipeline(updatedPipeline)
        }}
      >
        Update Pipeline
      </button>
    </div>
  )
})

describe('<PipelineTemplateCanvas/> tests', () => {
  test('should call updateTemplate with updated template', async () => {
    const templateContext = getTemplateContextMock(TemplateType.Pipeline)
    const { container, getByRole } = render(
      <TestWrapper>
        <TemplateContext.Provider value={templateContext}>
          <PipelineTemplateCanvasWithRef />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const updatePipelineButton = getByRole('button', { name: 'Update Pipeline' })
    await act(async () => {
      fireEvent.click(updatePipelineButton)
    })
    const updatedTemplate = produce(templateContext.state.template, draft => {
      set(draft, 'spec.stages[0].stage.spec.serviceConfig.serviceRef', 'Pipeline')
    })
    expect(templateContext.updateTemplate).toBeCalledWith(updatedTemplate)
  })

  test('should open templates variables drawer on a custom window event', async () => {
    const templateContext = getTemplateContextMock(TemplateType.Pipeline)
    render(
      <TestWrapper>
        <TemplateContext.Provider value={templateContext}>
          <PipelineTemplateCanvasWithRef />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    window.dispatchEvent(new CustomEvent('OPEN_PIPELINE_TEMPLATE_RIGHT_DRAWER', { detail: DrawerTypes.TemplateInputs }))
    expect(templateContext.updateTemplateView).toBeCalledWith({
      drawerData: { type: TemplateDrawerTypes.TemplateInputs },
      isDrawerOpened: true,
      isYamlEditable: false
    })
  })
})
