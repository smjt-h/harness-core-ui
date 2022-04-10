/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { TargetingRulesFormValues } from '../../Types.types'

const expectedFormValues: TargetingRulesFormValues = {
  formVariationMap: [
    {
      isVisible: true,
      targetGroups: [
        {
          identifier: 'target_group_2',
          name: 'target_group_2',
          ruleId: ''
        }
      ],
      targets: [
        {
          identifier: 'target2',
          name: 'target_2'
        }
      ],
      variationIdentifier: 'true',
      variationName: 'True'
    },
    {
      isVisible: true,
      targetGroups: [
        {
          identifier: 'randomID',
          name: 'target_group_4',
          ruleId: '9dec5abb-002e-45b3-b241-963ac5d9acde'
        },
        {
          identifier: 'random5',
          name: 'target_group_5',
          ruleId: '3ead64d0-3226-4726-8415-acce803fa34e'
        }
      ],
      targets: [
        {
          identifier: 'target1',
          name: 'target_1'
        }
      ],
      variationIdentifier: 'false',
      variationName: 'False'
    }
  ],
  onVariation: 'true',
  offVariation: 'false',
  state: 'off',
  variationPercentageRollouts: [
    {
      bucketBy: 'name',
      clauses: [
        {
          attribute: '',
          id: '0023fcae-39ee-4cc5-ae6b-ea7ba20733dc',
          negate: false,
          op: 'segmentMatch',
          values: ['targetGroup6']
        }
      ],
      ruleId: '455c109e-c995-4a4c-adb0-086ddd22ca39',
      variations: [
        {
          variation: 'true',
          weight: 70
        },
        {
          variation: 'false',
          weight: 30
        }
      ]
    }
  ]
}

export default expectedFormValues
