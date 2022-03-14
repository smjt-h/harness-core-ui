/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  ButtonVariation,
  Color,
  Container,
  Icon,
  Layout,
  TableV2,
  Text,
  TextInput,
  Label
} from '@harness/uicore'

import cx from 'classnames'
import css from './AnomaliesSettings.module.scss'

const AlertsSection = () => {
  const actionCell = () => {
    return (
      <Layout.Horizontal spacing="medium">
        <Icon name="Edit" size={16} color={Color.PRIMARY_6} />
        <Icon name="main-delete" size={16} color={Color.PRIMARY_6} />
      </Layout.Horizontal>
    )
  }

  return (
    <Container className={css.settingsContent} padding="large">
      <Text
        color={Color.PRIMARY_10}
        font={{ size: 'normal', weight: 'semi-bold' }}
        border={{ bottom: true, color: Color.GREY_200 }}
        padding={{ bottom: 'medium' }}
      >
        {'Alerts and notifications'}
      </Text>
      <Text color={Color.PRIMARY_10} font={{ size: 'small' }} padding={{ bottom: 'large', top: 'medium' }}>
        {'You can set up alerts for anomalies in perspectives or resources.'}
      </Text>
      <Button text="Create New Alert" icon="plus" variation={ButtonVariation.PRIMARY} />
      <TableV2
        className={css.tableView}
        columns={[
          {
            Header: 'Perspective',
            accessor: 'name',
            width: '30%'
          },
          {
            Header: 'Anomaly Alerts to',
            accessor: 'age',
            width: '50%'
          },
          {
            Header: ' ',
            Cell: actionCell,
            width: '5%'
          }
        ]}
        data={[
          {
            age: 20,
            name: 'User 1'
          },
          {
            age: 25,
            name: 'User 2'
          },
          {
            age: 25,
            name: 'User 3'
          },
          {
            age: 25,
            name: 'User 4'
          }
        ]}
        onRowClick={function noRefCheck() {
          // console.log("hello")
        }}
      />
    </Container>
  )
}

const WhitelistSection = () => {
  const actionCell = () => {
    return (
      <Layout.Horizontal spacing="medium">
        <a href="">{'Remove'}</a>
      </Layout.Horizontal>
    )
  }

  return (
    <Container className={css.settingsContent} padding="large">
      <Text
        color={Color.PRIMARY_10}
        font={{ size: 'normal', weight: 'semi-bold' }}
        border={{ bottom: true, color: Color.GREY_200 }}
        padding={{ bottom: 'medium' }}
      >
        {'Allowlist'}
      </Text>
      <Text color={Color.PRIMARY_10} font={{ size: 'small' }} padding={{ bottom: 'large', top: 'medium' }}>
        {
          'Allowlisting resouces exempts them from anomaly detection. You can add resources which might show known anomalies to this list.'
        }
      </Text>
      <Layout.Horizontal className={css.resourceSearchWrapper} spacing="small">
        <Layout.Vertical className={css.resourceSearchInput}>
          <Label>{'Specify resource'}</Label>
          <TextInput defaultValue="" />
        </Layout.Vertical>
        <Button text="Add to Allowlist" icon="plus" variation={ButtonVariation.PRIMARY} margin={{ top: 'small' }} />
      </Layout.Horizontal>
      <TableV2
        className={css.tableView}
        columns={[
          {
            Header: 'Allowlist',
            accessor: 'name',
            width: '75%'
          },
          {
            Header: ' ',
            Cell: actionCell,
            width: '5%'
          }
        ]}
        data={[
          {
            name: 'cluster/workload1'
          },
          {
            name: 'project/product/SKU1'
          },
          {
            name: 'cluster/workload2'
          },
          {
            name: 'cluster/workload3'
          }
        ]}
        onRowClick={function noRefCheck() {
          // console.log("hello")
        }}
      />
    </Container>
  )
}

interface settingsDrawerProps {
  hideDrawer: any
}

const AnomaliesSettings: React.FC<settingsDrawerProps> = ({ hideDrawer }) => {
  const [activePanelId, setActivePanelId] = useState(1)

  const getActivePanel = (id: number) => {
    switch (id) {
      case 1:
        return <AlertsSection />

      case 2:
        return <WhitelistSection />

      default:
        return <AlertsSection />
    }
  }

  const updateActivePanel = (id: number) => {
    setActivePanelId(id)
  }

  return (
    <Layout.Horizontal className={css.container}>
      {getActivePanel(activePanelId)}
      <Container className={css.settingsDrawer} background={Color.PRIMARY_8}>
        <Layout.Horizontal className={css.settingsLabelWarpper}>
          <Text
            font={{ size: 'normal', weight: 'semi-bold' }}
            className={css.tabContent}
            icon="nav-settings"
            padding="large"
          >
            {'Settings'}
          </Text>
          <Icon name="cross" size={16} color={Color.WHITE} onClick={() => hideDrawer()} />
        </Layout.Horizontal>
        <ul className={css.listingOptions}>
          <li className={cx(css.listOptionItem, activePanelId === 1 && css.listOptionItemSelected)}>
            <Text
              font={{ size: 'normal', weight: 'semi-bold' }}
              className={css.tabContent}
              onClick={() => updateActivePanel(1)}
            >
              {'Alerts and notifications'}
            </Text>
          </li>
          <li className={cx(css.listOptionItem, activePanelId === 2 && css.listOptionItemSelected)}>
            <Text
              font={{ size: 'normal', weight: 'semi-bold' }}
              className={css.tabContent}
              onClick={() => updateActivePanel(2)}
            >
              {'Allowlist'}
            </Text>
          </li>
        </ul>
      </Container>
    </Layout.Horizontal>
  )
}

export default AnomaliesSettings
