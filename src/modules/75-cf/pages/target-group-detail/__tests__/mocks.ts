/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { pick } from 'lodash-es'
import type { Feature, Segment, SegmentFlag } from 'services/cf'
import type { FlagSettingsFormData, TargetGroupFlagsMap } from '../TargetGroupDetailPage.types'

export const mockTargetGroup = {
  environment: 'e1',
  identifier: 'tg1'
} as Segment

export const mockFeatures = [
  {
    identifier: 'f1',
    name: 'Flag 1',
    variations: [
      { name: 'Variation 1', identifier: 'v1' },
      { name: 'Variation 2', identifier: 'v2' },
      { identifier: 'v3' }
    ],
    status: {
      lastAccess: 1645531989,
      status: 'active'
    }
  },
  {
    identifier: 'f2',
    name: 'Flag 2',
    variations: [
      { name: 'Variation 1', identifier: 'v1' },
      { name: 'Variation 2', identifier: 'v2' }
    ],
    status: {
      status: 'never-requested'
    }
  },
  {
    identifier: 'f3',
    name: 'Flag 3',
    variations: [
      { name: 'Variation 1', identifier: 'v1' },
      { name: 'Variation 2', identifier: 'v2' }
    ],
    status: {
      status: 'never-requested'
    }
  },
  {
    identifier: 'f4',
    name: 'Flag 4',
    variations: [
      { name: 'Variation 1', identifier: 'v1' },
      { name: 'Variation 2', identifier: 'v2' }
    ],
    status: {
      status: 'never-requested'
    }
  }
] as Feature[]

export const mockFlagWithPercentageRollout = {
  identifier: 'fWithPR',
  name: 'Flag with PR',
  variations: [
    { name: 'Variation 1', identifier: 'v1' },
    { name: 'Variation 2', identifier: 'v2' }
  ],
  status: {
    status: 'never-requested'
  },
  envProperties: {
    rules: [
      {
        ruleId: 'ruleId1',
        clauses: [{ op: 'segmentMatch', values: ['tg1'] }],
        serve: {
          distribution: {
            bucketBy: 'identifier',
            variations: [
              { variation: 'v1', weight: 60 },
              { variation: 'v2', weight: 40 }
            ]
          }
        }
      }
    ]
  }
} as Feature

export const mockSegmentFlags = [
  {
    identifier: 'f1',
    name: 'Flag 1',
    variation: 'v1',
    environment: 'e1',
    project: 'p1',
    type: 'CONDITION',
    ruleId: 'r1'
  },
  {
    identifier: 'f2',
    name: 'Flag 2',
    variation: 'v2',
    environment: 'e1',
    project: 'p1',
    type: 'CONDITION',
    ruleId: 'r2'
  },
  {
    identifier: 'f3',
    name: 'Flag 3',
    variation: 'v1',
    environment: 'e1',
    project: 'p1',
    type: 'CONDITION',
    ruleId: 'r3'
  },
  {
    identifier: 'f4',
    name: 'Flag 4',
    variation: 'v2',
    environment: 'e1',
    project: 'p1',
    type: 'CONDITION',
    ruleId: 'r4'
  }
] as SegmentFlag[]

export const mockTargetGroupFlagsMap: TargetGroupFlagsMap = {
  f1: {
    ...mockSegmentFlags[0],
    flag: mockFeatures[0]
  },
  f2: {
    ...mockSegmentFlags[1],
    flag: mockFeatures[1]
  },
  f3: {
    ...mockSegmentFlags[2],
    flag: mockFeatures[2]
  },
  f4: {
    ...mockSegmentFlags[3],
    flag: mockFeatures[3]
  }
}

export const mockFlagSettingsFormDataValues: FlagSettingsFormData = {
  flags: {
    f1: { ...pick(mockSegmentFlags[0], 'identifier', 'variation') },
    f2: { ...pick(mockSegmentFlags[1], 'identifier', 'variation') },
    f3: { ...pick(mockSegmentFlags[2], 'identifier', 'variation') },
    f4: { ...pick(mockSegmentFlags[3], 'identifier', 'variation') }
  }
}
