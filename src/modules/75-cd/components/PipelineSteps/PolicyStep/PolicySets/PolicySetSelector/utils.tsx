/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FontVariation, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'

export const PolicySetSelectorDialogTitle = (): JSX.Element => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal
      spacing="xsmall"
      padding={{ top: 'xxlarge', left: 'medium', right: 'large', bottom: 'medium' }}
      flex={{ justifyContent: 'space-between' }}
    >
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.H3 }}>{getString('common.policiesSets.selectPolicySet')}</Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
