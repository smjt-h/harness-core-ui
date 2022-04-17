/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Clause, TargetMap, WeightedVariation } from 'services/cf'

export enum TargetingRuleItemType {
  VARIATION = 'VARIATION',
  PERCENTAGE_ROLLOUT = 'PERCENTAGE_ROLLOUT'
}

export interface TargetingRulesFormValues {
  state: string
  onVariation: string
  offVariation: string
  targetingRuleItems: (FormVariationMap | VariationPercentageRollout)[]
}
export interface TargetGroup {
  priority: number
  identifier: string
  ruleId: string
  name: string
}

export interface VariationPercentageRollout {
  priority: number
  variations: WeightedVariation[]
  bucketBy: string
  clauses: Clause[]
  ruleId: string
  type: string
}
export interface FormVariationMap {
  priority: number
  variationIdentifier: string
  variationName: string
  targetGroups: TargetGroup[]
  targets: TargetMap[]
  type: string
}

export interface VariationColorMap {
  [key: string]: string
}
