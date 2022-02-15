/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Features } from 'services/cf'
import type { FeatureFlagConfigurationInstruction, FlagConfigurationStepData } from '../types'

export const mockFeatures = {
  features: [
    {
      name: 'Multi Flag',
      identifier: 'f1',
      variations: [
        { name: 'Variation 1', identifier: 'v1', value: 'v1' },
        { name: 'Variation 2', identifier: 'v2', value: 'v2' },
        { name: 'Variation 3', identifier: 'v3', value: 'v3' }
      ]
    },
    {
      name: 'Bool Flag',
      identifier: 'f2',
      variations: [
        { name: 'True', identifier: 'true', value: 'true' },
        { name: 'False', identifier: 'false', value: 'false' }
      ]
    }
  ]
} as Features

export const mockIncompleteInstruction: FeatureFlagConfigurationInstruction = {
  identifier: 'AddRuleIdentifier',
  type: 'AddRule',
  spec: {
    priority: 100,
    distribution: {
      clauses: [
        {
          op: 'segmentMatch',
          attribute: ''
        }
      ],
      variations: [
        {
          variation: 'v1',
          weight: 75
        },
        {
          variation: 'v2',
          weight: 25
        }
      ],
      bucketBy: 'identifier'
    }
  }
}

export const mockCompleteInstruction: FeatureFlagConfigurationInstruction = {
  identifier: 'AddRuleIdentifier',
  type: 'AddRule',
  spec: {
    priority: 100,
    distribution: {
      clauses: [
        {
          op: 'segmentMatch',
          attribute: ''
        }
      ],
      variations: [
        {
          variation: 'v1',
          weight: 75
        },
        {
          variation: 'v2',
          weight: 25
        },
        {
          variation: 'v3',
          weight: 0
        }
      ],
      bucketBy: 'identifier'
    }
  }
}

export const mockNonPercentageRolloutInstruction: FeatureFlagConfigurationInstruction = {
  identifier: 'SetFeatureFlagStateIdentifier',
  type: 'SetFeatureFlagState',
  spec: {
    state: 'on'
  }
}

export const mockInitialValues: FlagConfigurationStepData = {
  type: 'FlagConfiguration',
  name: 'Test',
  identifier: 'Test1',
  spec: {
    feature: 'f1',
    environment: 'e1',
    instructions: [mockCompleteInstruction]
  },
  timeout: '10m'
}
