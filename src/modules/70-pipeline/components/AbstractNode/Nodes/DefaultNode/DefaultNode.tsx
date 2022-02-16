/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@wings-software/uicore'
import { Icon, Text, Color } from '@wings-software/uicore'
import cx from 'classnames'
import css from './DefaultNode.module.scss'

const iconStyle = {
  color: 'var(--white)'
}
const SECONDARY_ICON: IconName = 'command-echo'

const DefaultNode = (props: any): JSX.Element => {
  return (
    <div
      className={cx(css.defaultNode, 'default-node')}
      onClick={() => {
        props?.setSelectedNode(props?.identifier)
      }}
    >
      <div
        id={props.identifier}
        className={cx(css.defaultCard, { [css.selected]: props?.isSelected })}
        style={{
          width: props.width || 90,
          height: props.height || 40,
          marginTop: 32 - (props.height || 64) / 2,
          cursor: props.disableClick ? 'not-allowed' : props.draggable ? 'move' : 'pointer',
          opacity: props.dragging ? 0.4 : 1
        }}
      >
        <div className="execution-running-animation" />
        {props.iconName && (
          <Icon
            size={28}
            name={props.iconName}
            inverse={props?.isSelected}
            // {...options.iconProps}
            style={{ pointerEvents: 'none', ...iconStyle }}
          />
        )}

        {SECONDARY_ICON && <Icon className={css.secondaryIcon} size={8} name={SECONDARY_ICON} />}
      </div>
      {props.name && (
        <Text
          font={{ size: 'normal', align: 'center' }}
          color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
          style={{ cursor: 'pointer', lineHeight: '1.5', overflowWrap: 'normal', wordBreak: 'keep-all', height: 55 }}
          padding={'small'}
          lineClamp={2}
        >
          {props.name}
        </Text>
      )}
    </div>
  )
}

export default DefaultNode
