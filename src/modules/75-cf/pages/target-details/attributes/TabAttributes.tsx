/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { Target } from 'services/cf'
import { ItemContainer } from '@cf/components/ItemContainer/ItemContainer'

export interface TabAttributesProps {
  target: Target
}

const TabAttributes: React.FC<TabAttributesProps> = ({ target }) => {
  const { getString } = useStrings()
  const attributes = {
    [getString('identifier')]: target.identifier,
    [getString('name')]: target.name,
    ...target?.attributes
  }

  function formatAttributeValue(value: boolean | string): string {
    if (typeof value === 'boolean') {
      return value ? getString('cf.shared.true') : getString('cf.shared.false')
    }

    return value
  }

  return (
    <Layout.Vertical spacing="small" padding={{ top: 'xsmall', right: 'xxlarge', left: 'xxlarge', bottom: 'xxlarge' }}>
      {Object.entries(attributes).map(([key, value]) => (
        <ItemContainer key={key}>
          <Text lineClamp={1} margin={{ bottom: 'xsmall' }} font={{ variation: FontVariation.FORM_LABEL }}>
            {key}
          </Text>
          <Text lineClamp={2} color={Color.GREY_800}>
            {formatAttributeValue(value)}
          </Text>
        </ItemContainer>
      ))}
    </Layout.Vertical>
  )
}

export default TabAttributes
