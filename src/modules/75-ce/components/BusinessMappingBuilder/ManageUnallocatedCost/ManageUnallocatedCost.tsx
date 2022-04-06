/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, FormInput, Layout, RadioButton } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { UnallocatedCost } from 'services/ce'
import css from './ManageUnallocatedCost.module.scss'

interface ManageUnallocatedCostProps {
  data: UnallocatedCost
}

const ManageUnallocatedCost: (props: ManageUnallocatedCostProps) => React.ReactElement = ({ data }) => {
  const isLabelPresent = data.label ? true : false
  const { getString } = useStrings()
  return (
    <Container>
      <Layout.Horizontal spacing="small" className={css.hContainer}>
        <RadioButton
          label={getString('ce.businessMapping.manageUnallocatedCost.defaultUnallocatedCostLabel')}
          value="default"
          checked={isLabelPresent}
        />
        <FormInput.Text
          name="unallocatedCost.label"
          placeholder={getString('ce.businessMapping.manageUnallocatedCost.otherPlaceholder')}
          className={css.defaultValInputBox}
          disabled={!isLabelPresent}
        />
      </Layout.Horizontal>
      <RadioButton label={getString('ce.businessMapping.manageUnallocatedCost.ignoreCostLabel')} value={'-'} disabled />
      <RadioButton label={getString('ce.businessMapping.manageUnallocatedCost.shareCosts')} value={'-'} disabled />
    </Container>
  )
}

export default ManageUnallocatedCost
