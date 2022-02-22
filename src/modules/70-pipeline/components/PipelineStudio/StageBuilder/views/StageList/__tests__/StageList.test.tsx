/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import type { IconName } from '@harness/uicore'
import { StageType } from '@pipeline/utils/stageHelpers'
import { StageList } from '../StageList'
const baseProps = {
  stages: [
    { stage: { name: 'Stage 1', identifier: 'Stage_1', template: { templateRef: 'Stage_Template' } } },
    { stage: { name: 'Stage 2', identifier: 'Stage_2', type: 'Deployment', spec: {} } }
  ],
  stagesMap: {
    Deployment: {
      name: 'Deploy',
      type: StageType.DEPLOY,
      icon: 'cd-main' as IconName,
      iconColor: 'var(--pipeline-deploy-stage-color)',
      isApproval: false,
      openExecutionStrategy: true
    }
  },
  templateTypes: { Stage_Template: 'Deployment' }
}
describe('<StageList /> tests', () => {
  test('should match snapshot', async () => {
    const { container } = render(<StageList {...baseProps} />)
    expect(container).toMatchSnapshot()
  })

  test('should have template icon for template stage', async () => {
    const { container } = render(<StageList {...baseProps} />)
    const stageRows = container.getElementsByClassName('stageRow')
    expect(stageRows).toHaveLength(2)
    const templateLibraryIconFirstRow = stageRows[0].querySelector('span[data-icon="template-library"]')
    expect(templateLibraryIconFirstRow).toBeDefined()
    const templateLibraryIconSecondRow = stageRows[1].querySelector('span[data-icon="template-library"]')
    expect(templateLibraryIconSecondRow).toBeNull()
  })

  test('should render selected stage first', async () => {
    const props = { ...baseProps, selectedStageId: 'Stage_2' }
    const { container } = render(<StageList {...props} />)
    const stageRows = container.getElementsByClassName('stageRow')
    expect(stageRows[0]).toHaveTextContent('Stage 2')
    expect(stageRows[1]).toHaveTextContent('Stage 1')
  })

  test('should trigger onClick when clicked on stage row', async () => {
    const props = { ...baseProps, onClick: jest.fn() }
    const { container } = render(<StageList {...props} />)
    const stageRows = container.getElementsByClassName('stageRow')
    act(() => {
      fireEvent.click(stageRows[0])
    })
    expect(props.onClick).toBeCalledWith('Stage_1', 'Deployment')
    act(() => {
      fireEvent.click(stageRows[1])
    })
    expect(props.onClick).toBeCalledWith('Stage_2', 'Deployment')
  })
})
