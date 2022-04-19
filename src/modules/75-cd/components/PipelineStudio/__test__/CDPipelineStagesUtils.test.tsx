/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getByText, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { getCDPipelineStages as GetCDPipelineStages } from '../CDPipelineStagesUtils'

const TEST_PATH = routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })
const argsMock = {
  showSelectMenu: true,
  contextType: 'Pipeline'
}

describe('Testing Empty pipeline stages', () => {
  test('should render empty stage view on right section when no stagetype is rendered', async () => {
    const { container } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'editPipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <GetCDPipelineStages getString={jest.fn()} args={argsMock} />
      </TestWrapper>
    )
    const addStage = await waitFor(() => getByText(document.body, 'pipeline.addStage.description'))
    expect(addStage).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})
