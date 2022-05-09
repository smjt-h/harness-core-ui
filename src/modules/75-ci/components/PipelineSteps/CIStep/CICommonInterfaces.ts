/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiTypeInputType } from '@harness/uicore'
import type { StringsMap } from 'stringTypes'
import type { ConnectorReferenceProps } from '@common/components/MultiTypeMap/MultiTypeMap'

export interface MultiTypeMapInputSetPropsInterface extends ConnectorReferenceProps {
  fieldName: string
  stringKey: keyof StringsMap
  tooltipId?: string
  keyLabel?: keyof StringsMap
  valueLabel?: keyof StringsMap
  restrictToSingleEntry?: boolean
}

export interface MultiTypeMapPropsInterface extends MultiTypeMapInputSetPropsInterface {
  allowableTypes: MultiTypeInputType[]
}
