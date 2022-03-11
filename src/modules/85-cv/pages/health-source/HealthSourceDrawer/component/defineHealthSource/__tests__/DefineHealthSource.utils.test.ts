/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { HealthSourceTypes } from '@cv/pages/health-source/types'
import { getFeatureOption, modifyCustomHealthFeatureBasedOnFF } from '../DefineHealthSource.utils'

describe('Unit tests for DefineHealthSource utils', () => {
  test('Ensure modifyCustomHealthFeatureBasedOnFF works as intended', async () => {
    const customHealthOptions = getFeatureOption(HealthSourceTypes.CustomHealth, str => str)
    expect(modifyCustomHealthFeatureBasedOnFF(true, true, customHealthOptions)).toEqual(customHealthOptions)
    expect(modifyCustomHealthFeatureBasedOnFF(false, true, customHealthOptions)).toEqual([customHealthOptions[0]])
    expect(modifyCustomHealthFeatureBasedOnFF(true, false, customHealthOptions)).toEqual([customHealthOptions[1]])
    expect(modifyCustomHealthFeatureBasedOnFF(false, false, customHealthOptions)).toEqual([])
  })
})
