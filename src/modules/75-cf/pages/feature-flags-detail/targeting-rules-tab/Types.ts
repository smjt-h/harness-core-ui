/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { WeightedVariation, Clause } from 'services/cd-ng'
import type { TargetMap, Feature } from 'services/cf'

export interface TargetingRulesFormValues {
  state: string
  onVariation: string
  formVariationMap: FormVariationMap[]
  variationPercentageRollout?: PercentageRollout
}
export interface TargetGroup {
  identifier: string
  ruleId: string
  name: string
}

export interface PercentageRollout {
  variations: WeightedVariation[] | []
  bucketBy: string
  clauses: Clause[]
}
export interface FormVariationMap {
  variationIdentifier: string
  variationName: string
  targetGroups: TargetGroup[] | []
  targets: TargetMap[] | []
  isVisible: boolean
}
export interface TargetingRulesTabProps {
  featureFlagData: Feature
  refetchFlag: () => Promise<unknown>
  refetchFlagLoading: boolean
}
