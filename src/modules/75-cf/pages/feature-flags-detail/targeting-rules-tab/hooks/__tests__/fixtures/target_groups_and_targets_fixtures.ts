/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TargetingRuleItemType, VariationPercentageRollout } from '../../../Types.types'

const mockPercentageVariationRollout: VariationPercentageRollout = {
  priority: 100,
  type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
  bucketBy: '',
  clauses: [{ attribute: '', negate: false, op: 'segmentmatch', id: '', values: [''] }],
  ruleId: '',
  variations: []
}

const targetGroupsAddedFixture = {
  initialFormVariationMap: {
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [],
    targetGroups: [
      {
        priority: 101,
        identifier: 'target_group_1',
        ruleId: 'a3840b52-2b76-45af-93da-2eec20e7299c',
        name: 'target_group_1'
      }
    ],
    isVisible: true
  },

  newFormVariationMap: {
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [],
    targetGroups: [
      {
        priority: 101,
        identifier: 'target_group_1',
        ruleId: '',
        name: 'target_group_1'
      },
      {
        priority: 102,
        identifier: 'target_group_2',
        ruleId: '',
        name: 'target_group_2'
      },
      {
        priority: 103,
        identifier: 'target_group_3',
        ruleId: '',
        name: 'target_group_3'
      }
    ],
    isVisible: true
  },
  expected: {
    instructions: [
      {
        kind: 'addRule',
        parameters: {
          clauses: [{ op: 'segmentMatch', values: ['target_group_2'] }],
          priority: 100,
          serve: { variation: 'true' },
          uuid: 'UUID'
        }
      },
      {
        kind: 'addRule',
        parameters: {
          clauses: [{ op: 'segmentMatch', values: ['target_group_3'] }],
          priority: 100,
          serve: { variation: 'true' },
          uuid: expect.anything()
        }
      }
    ]
  }
}

const targetGroupsRemovedFixture = {
  initialFormVariationMap: {
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [],
    targetGroups: [
      {
        priority: 101,
        identifier: 'target_group_1',
        ruleId: 'a3840b52-2b76-45af-93da-2eec20e7299c',
        name: 'target_group_1'
      },
      {
        priority: 102,
        identifier: 'target_group_2',
        ruleId: 'a3240b52-2b76-45af-93da-2eec20e33333',
        name: 'target_group_2'
      }
    ],
    isVisible: true
  },
  newFormVariationMap: {
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [],
    targetGroups: [],
    isVisible: true
  },
  expected: {
    instructions: [
      { kind: 'removeRule', parameters: { ruleID: 'a3840b52-2b76-45af-93da-2eec20e7299c' } },
      { kind: 'removeRule', parameters: { ruleID: 'a3240b52-2b76-45af-93da-2eec20e33333' } }
    ]
  }
}

const targetAddedFixture = {
  initialFormVariationMap: {
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [
      {
        identifier: 'target1',
        name: 'target_1'
      }
    ],
    targetGroups: [],
    isVisible: true
  },
  newFormVariationMap: {
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [
      {
        identifier: 'target1',
        name: 'target_1'
      },
      {
        identifier: 'target2',
        name: 'target_2'
      }
    ],
    targetGroups: [],
    isVisible: true
  },
  expected: {
    instructions: [{ kind: 'addTargetsToVariationTargetMap', parameters: { targets: ['target2'], variation: 'true' } }]
  }
}

const targetRemovedFixture = {
  initialFormVariationMap: {
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [
      {
        identifier: 'target1',
        name: 'target_1'
      },
      {
        identifier: 'target2',
        name: 'target_2'
      }
    ],
    targetGroups: [],
    isVisible: true
  },
  newFormVariationMap: {
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [
      {
        identifier: 'target2',
        name: 'target_2'
      }
    ],
    targetGroups: [],
    isVisible: true
  },
  expected: {
    instructions: [
      { kind: 'removeTargetsToVariationTargetMap', parameters: { targets: ['target1'], variation: 'true' } }
    ]
  }
}

const percentageRolloutAdded = {
  initialVariationPercentageRollout: {
    bucketBy: 'identifier',
    clauses: [],
    isVisible: false,
    ruleId: '',
    variations: []
  },
  newPercentageRolloutAdded: {
    priority: 100,
    type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
    bucketBy: 'identifier',
    clauses: [
      {
        attribute: '',
        id: '',
        negate: false,
        op: '',
        values: ['target_group_1']
      }
    ],
    variations: [
      {
        variation: 'true',
        weight: 40
      },
      {
        variation: 'false',
        weight: 60
      }
    ],
    ruleId: '5170032c-5100-42d2-b044-761ac91e50bb',
    isVisible: true
  },
  expected: {
    instructions: [
      {
        kind: 'addRule',
        parameters: {
          uuid: 'UUID',
          priority: 102,
          serve: {
            distribution: {
              bucketBy: 'identifier',
              variations: [
                { variation: 'true', weight: 40 },
                { variation: 'false', weight: 60 }
              ]
            }
          },
          clauses: [{ op: 'segmentMatch', values: ['target_group_1'] }]
        }
      }
    ]
  }
}

const percentageRolloutUpdated = {
  initialVariationPercentageRollout: {
    priority: 100,
    type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
    variations: [
      {
        variation: 'true',
        weight: 30
      },
      {
        variation: 'false',
        weight: 70
      }
    ],
    bucketBy: 'identifier',
    clauses: [
      {
        attribute: '',
        id: 'e6512660-cb37-4986-9d9c-8d3030f3d53a',
        negate: false,
        op: 'segmentMatch',
        values: ['target_group_1']
      }
    ],
    ruleId: '006731d6-1f58-4877-8ff5-68cbb885b75c',
    isVisible: true
  },
  newPercentageRolloutAdded: {
    priority: 100,
    type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
    variations: [
      {
        variation: 'true',
        weight: 90
      },
      {
        variation: 'false',
        weight: 10
      }
    ],
    bucketBy: 'identifier',
    clauses: [
      {
        attribute: '',
        id: 'e6512660-cb37-4986-9d9c-8d3030f3d53a',
        negate: false,
        op: 'segmentMatch',
        values: ['randomID']
      }
    ],
    ruleId: '006731d6-1f58-4877-8ff5-68cbb885b75c',
    isVisible: true
  },
  expected: {
    instructions: [
      {
        kind: 'updateRule',
        parameters: {
          bucketBy: 'identifier',
          ruleID: '006731d6-1f58-4877-8ff5-68cbb885b75c',
          variations: [
            {
              variation: 'true',
              weight: 90
            },
            {
              variation: 'false',
              weight: 10
            }
          ]
        }
      },
      {
        kind: 'updateClause',
        parameters: {
          clause: {
            attribute: '',
            negate: false,
            op: 'segmentMatch',
            values: ['randomID']
          },
          clauseID: 'e6512660-cb37-4986-9d9c-8d3030f3d53a',
          ruleID: '006731d6-1f58-4877-8ff5-68cbb885b75c'
        }
      }
    ]
  }
}

const percentageRolloutRemoved = {
  initialVariationPercentageRollout: {
    priority: 100,
    type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
    variations: [
      {
        variation: 'true',
        weight: 30
      },
      {
        variation: 'false',
        weight: 30
      }
    ],
    bucketBy: 'identifier',
    clauses: [
      {
        attribute: '',
        id: 'e6512660-cb37-4986-9d9c-8d3030f3d53a',
        negate: false,
        op: 'segmentMatch',
        values: ['target_group_1']
      }
    ],
    ruleId: '006731d6-1f58-4877-8ff5-68cbb885b75c',
    isVisible: true
  },
  newPercentageRolloutAdded: {
    variations: [
      {
        variation: 'true',
        weight: 90
      },
      {
        variation: 'false',
        weight: 10
      }
    ],
    bucketBy: 'identifier',
    clauses: [
      {
        attribute: '',
        id: 'e6512660-cb37-4986-9d9c-8d3030f3d53a',
        negate: false,
        op: 'segmentMatch',
        values: ['target_group_1']
      }
    ],
    ruleId: '006731d6-1f58-4877-8ff5-68cbb885b75c',
    isVisible: false
  },
  expected: { instructions: [{ kind: 'removeRule', parameters: { ruleID: '006731d6-1f58-4877-8ff5-68cbb885b75c' } }] }
}

export {
  mockPercentageVariationRollout,
  percentageRolloutAdded,
  percentageRolloutUpdated,
  percentageRolloutRemoved,
  targetGroupsAddedFixture,
  targetGroupsRemovedFixture,
  targetAddedFixture,
  targetRemovedFixture
}
