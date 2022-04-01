/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useMemo } from 'react'
import { FormInput, SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { Feature } from 'services/cf'

export interface VariationsCellProps {
  flag: Feature
  fieldPrefix: string
  disabled?: boolean
}

const VariationsCell: FC<VariationsCellProps> = ({ flag, fieldPrefix, disabled = false }) => {
  const { getString } = useStrings()

  const flagItems = useMemo<SelectOption[]>(
    () =>
      flag.variations.map<SelectOption>(({ identifier, name }) => ({
        label: name || identifier,
        value: identifier
      })),
    [flag.variations]
  )

  return (
    <FormInput.Select
      placeholder={getString('cf.segmentDetail.selectVariation')}
      name={`${fieldPrefix}.variation`}
      items={flagItems}
      style={{ margin: 0 }}
      disabled={disabled}
    />
  )
}

export default VariationsCell
