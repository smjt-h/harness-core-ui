/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { FontVariation, Text } from '@harness/uicore'
import type { Feature } from 'services/cf'

export interface FlagDetailsCellProps {
  flag: Feature
}

const FlagDetailsCell: FC<FlagDetailsCellProps> = ({ flag }) => (
  <>
    <Text lineClamp={1} font={{ variation: FontVariation.BODY2 }}>
      {flag.name}
    </Text>
    {flag.description && <Text lineClamp={2}>{flag.description}</Text>}
  </>
)

export default FlagDetailsCell
