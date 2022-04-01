/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { Feature } from 'services/cf'

export interface AddFlagCheckboxCellProps {
  flag: Feature
  fieldPrefix: string
}

const AddFlagCheckboxCell: FC<AddFlagCheckboxCellProps> = ({ flag, fieldPrefix }) => {
  const { getString } = useStrings()

  return (
    <FormInput.CheckBox
      label=""
      aria-label={getString('cf.segmentDetail.addFlagNameToTargetGroup', { flagName: flag.name })}
      name={`${fieldPrefix}.added`}
      style={{ margin: 0 }}
    />
  )
}

export default AddFlagCheckboxCell
