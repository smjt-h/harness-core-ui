/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, IconName, Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
export interface GitPopoverInfoProps {
  heading: string
  content: string
  iconName: IconName
  iconSize?: number
  contentTextProps?: Record<string, any>
}

function GitPopoverInfo(props: GitPopoverInfoProps): React.ReactElement | null {
  const { heading, iconName, content, contentTextProps } = props
  return content.length ? (
    <Layout.Vertical spacing="large">
      <Text font={{ size: 'small' }} color={Color.GREY_400}>
        {heading}
      </Text>
      <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
        <Icon name={iconName} size={16} color={Color.GREY_700} />
        <Text font={{ size: 'small' }} color={Color.GREY_800} {...contentTextProps}>
          {content}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  ) : null
}

export default GitPopoverInfo
