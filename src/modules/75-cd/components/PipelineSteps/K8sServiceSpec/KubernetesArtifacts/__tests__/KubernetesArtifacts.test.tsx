/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import { ArtifactSourceBaseFactory } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { ArtifactListConfig, ServiceSpec } from 'services/cd-ng'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { KubernetesArtifacts } from '../KubernetesArtifacts'
import { artifacts, template } from '../KubernetesPrimaryArtifacts/__tests__/mocks'

describe('<KubernetesArtifacts /> tests', () => {
  test('snapshot test for kubernetes artifacts', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesArtifacts
          type={'artifact'}
          initialValues={{}}
          template={template as ServiceSpec}
          artifacts={artifacts as ArtifactListConfig}
          readonly
          stageIdentifier="stage-0"
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          fromTrigger={false}
          stepViewType={StepViewType.DeploymentForm}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
