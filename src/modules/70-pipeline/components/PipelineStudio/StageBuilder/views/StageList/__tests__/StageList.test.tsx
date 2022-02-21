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
    { stage: { name: 'Stage 1', identifier: 'Stage_1', type: 'Deployment', spec: {} } },
    { stage: { name: 'Stage 2', identifier: 'Stage_2', template: { templateRef: 'Stage_Template' } } }
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
  test('snapshot test', async () => {
    const { container } = render(<StageList {...baseProps} />)
    expect(container).toMatchSnapshot()
  })
  test('Test Add selected stage at the start- Stage_2 before Stage_1', async () => {
    const props = { ...baseProps, selectedStageId: 'Stage_2', onClick: jest.fn() }
    const { container } = render(<StageList {...props} />)
    expect(container).toMatchSnapshot()
    // Test onClick from props should be invoked
    const element = document.getElementsByClassName('Layout--horizontal')
    const stage2 = element[0]
    act(() => {
      fireEvent.click(stage2)
    })
  })
})
