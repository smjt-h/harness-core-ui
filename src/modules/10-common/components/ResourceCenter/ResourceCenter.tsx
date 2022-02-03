/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, ButtonVariation, Color, FontVariation, Icon, IconName, Layout, Text } from '@wings-software/uicore'
import { Drawer, Position } from '@blueprintjs/core'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import resourceImage from './images/resource-center.png'
import css from './ResourceCenter.module.scss'

const getButton = (buttonText: string, buttonIcon: string, link: string): JSX.Element => {
  return (
    <a href={link} rel="noreferrer" target="_blank">
      <Layout.Vertical
        flex={{ align: 'center-center' }}
        spacing="small"
        padding={'small'}
        className={cx(css.bottombutton)}
      >
        <Icon name={buttonIcon as IconName} size={24} color={Color.WHITE} />
        <Text font={{ variation: FontVariation.BODY2 }} padding={{ bottom: 'xsmall' }} color={Color.PRIMARY_3}>
          {buttonText}
        </Text>
      </Layout.Vertical>
    </a>
  )
}

const menuItems = (title: string, description: string): JSX.Element => {
  return (
    <>
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'xsmall' }} color={Color.PRIMARY_3}>
          {title}
        </Text>
        <Text font={{ variation: FontVariation.BODY2 }} padding={{ bottom: 'xsmall' }} color={Color.WHITE}>
          {description}
        </Text>
      </Layout.Vertical>
      <Button icon="chevron-right" variation={ButtonVariation.ICON} disabled />
    </>
  )
}

export const ResourceCenter = (): React.ReactElement => {
  const { getString } = useStrings()

  const [show, setShow] = useState<boolean>(false)

  if (!show) {
    return (
      <Icon
        name={'question'}
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          setShow(true)
        }}
        data-testid="question"
        className={css.question}
      />
    )
  }

  return (
    <Drawer
      autoFocus
      enforceFocus
      hasBackdrop
      usePortal
      canOutsideClickClose
      canEscapeKeyClose
      position={Position.BOTTOM_LEFT}
      isOpen={show}
      onClose={() => {
        setShow(false)
      }}
      className={css.resourceCenter}
    >
      <Layout.Vertical>
        <Layout.Vertical padding={'xlarge'} flex={{ alignItems: 'baseline' }}>
          <Layout.Horizontal
            padding={{ bottom: 'medium' }}
            className={css.title}
            flex={{ justifyContent: 'space-between', alignItems: 'baseline' }}
          >
            <Text color={Color.WHITE}>{getString('common.resourceCenter.title')}</Text>
            <Button
              icon={'cross'}
              variation={ButtonVariation.ICON}
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                setShow(false)
              }}
            />
          </Layout.Horizontal>
          <img src={resourceImage} height={106} alt={'Resource center image'} />
        </Layout.Vertical>
        <Layout.Vertical padding={'xlarge'} className={css.middleregion}>
          <Layout.Horizontal
            padding={{ bottom: 'medium' }}
            flex={{ justifyContent: 'space-between' }}
            className={css.myticket}
          >
            {menuItems(
              getString('common.resourceCenter.ticketmenu.tickets'),
              getString('common.resourceCenter.ticketmenu.ticketsDesc')
            )}
          </Layout.Horizontal>
          <Layout.Horizontal padding={{ top: 'medium' }} flex={{ justifyContent: 'space-between' }}>
            {menuItems(
              getString('common.resourceCenter.ticketmenu.submit'),
              getString('common.resourceCenter.ticketmenu.submitDesc')
            )}
          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical padding={'xlarge'}>
          <Text font={{ variation: FontVariation.BODY2 }} padding={{ bottom: 'medium' }} color={Color.WHITE}>
            {getString('common.resourceCenter.bottomlayout.desc')}
          </Text>
          <Layout.Horizontal flex={{ justifyContent: 'space-around' }}>
            {getButton(getString('search'), 'thinner-search', 'https://harness.io/search/')}
            {getButton(
              getString('common.resourceCenter.bottomlayout.docs.text'),
              'resource-center-docs-icon',
              'https://docs.harness.io/'
            )}
            {getButton(
              getString('common.resourceCenter.bottomlayout.community.text'),
              'resource-center-community-icon',
              'https://community.harness.io/'
            )}
            {getButton(
              getString('common.resourceCenter.bottomlayout.sitestatus.text'),
              'right-bar-notification',
              'https://status.harness.io/'
            )}
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Vertical>
    </Drawer>
  )
}
