/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { render } from '@testing-library/react'

import { MultiTypeInputType } from '@harness/uicore'
import { ArtifactSourceBaseFactory } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import { TestWrapper } from '@common/utils/testUtils'
import ArtifactTagRuntimeField from '../ArtifactTagRuntimeField'

import { props } from './mocks'

describe('Artifact Tag Runtime Field tests', () => {
  test('Should match snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <ArtifactTagRuntimeField
          {...props}
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          isFieldDisabled={jest.fn()}
          fetchingTags={false}
          fetchTagsError={null}
          fetchTags={jest.fn()}
          isTagsSelectionDisabled={jest.fn()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          expressions={[]}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
