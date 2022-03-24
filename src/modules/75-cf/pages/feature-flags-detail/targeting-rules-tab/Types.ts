/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { WeightedVariation, Clause } from 'services/cd-ng'
import type { TargetMap } from 'services/cf'

export interface TargetingRulesFormValues {
  state: string
  onVariation: string
  formVariationMap: FormVariationMap[]
  variationPercentageRollout: VariationPercentageRollout
}
export interface TargetGroup {
  identifier: string
  ruleId: string
  name: string
}

export interface VariationPercentageRollout {
  variations: WeightedVariation[] | []
  bucketBy: string
  clauses: Clause[]
  ruleId: string
  isVisible: boolean
}
export interface FormVariationMap {
  variationIdentifier: string
  variationName: string
  targetGroups: TargetGroup[] | []
  targets: TargetMap[] | []
  isVisible: boolean
}
