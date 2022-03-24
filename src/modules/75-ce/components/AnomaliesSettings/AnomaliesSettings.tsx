/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, ButtonVariation, Color, Container, Icon, Layout, TableV2, Text } from '@harness/uicore'

import cx from 'classnames'
import type { Column } from 'react-table'
import { useStrings } from 'framework/strings'
import useAnomaliesAlertDialog from '../AnomaliesAlert/AnomaliesAlertDialog'
import css from './AnomaliesSettings.module.scss'

interface AlertData {
  age: number
  name: string
}

const alertList = [
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
]

const AlertsSection = () => {
  const { getString } = useStrings()
  const { openAnomaliesAlertModal } = useAnomaliesAlertDialog()

  const actionCell = () => {
    return (
      <Layout.Horizontal spacing="medium">
        <Icon name="Edit" size={16} color={Color.PRIMARY_6} />
        <Icon name="bin-main" size={16} color={Color.PRIMARY_6} />
      </Layout.Horizontal>
    )
  }

  const columns: Column<AlertData>[] = React.useMemo(
    () => [
      {
        Header: getString('ce.anomalyDetection.settings.perspectiveNameColumn'),
        accessor: 'name',
        width: '45%'
      },
      {
        Header: getString('ce.anomalyDetection.tableHeaders.details'),
        accessor: 'age',
        width: '50%'
      },
      {
        Header: ' ',
        Cell: actionCell,
        width: '5%'
      }
    ],
    []
  )

  return (
    <Container className={css.settingsContent} padding="large">
      <Text
        color={Color.PRIMARY_10}
        font={{ size: 'normal', weight: 'semi-bold' }}
        border={{ bottom: true, color: Color.GREY_200 }}
        padding={{ bottom: 'medium' }}
      >
        {getString('ce.anomalyDetection.settings.heading')}
      </Text>
      <Text color={Color.PRIMARY_10} font={{ size: 'small' }} padding={{ bottom: 'large', top: 'medium' }}>
        {getString('ce.anomalyDetection.settings.subtext')}
      </Text>
      <Button
        text={getString('ce.anomalyDetection.settings.newAlertBtn')}
        icon="plus"
        onClick={() => openAnomaliesAlertModal()}
        variation={ButtonVariation.PRIMARY}
      />
      <TableV2
        className={css.tableView}
        minimal={true}
        // Need to replace with useMemo
        columns={columns}
        data={alertList}
      />
    </Container>
  )
}

interface SettingsDrawerProps {
  hideDrawer: any
}

const AnomaliesSettings: React.FC<SettingsDrawerProps> = ({ hideDrawer }) => {
  const [activePanelId, setActivePanelId] = useState(1)
  const { getString } = useStrings()

  const updateActivePanel = (id: number) => {
    setActivePanelId(id)
  }

  return (
    <Layout.Horizontal className={css.container}>
      <AlertsSection />
      <Container className={css.settingsDrawer} background={Color.PRIMARY_8}>
        <Layout.Horizontal className={css.settingsLabelWarpper}>
          <Text
            font={{ size: 'normal', weight: 'semi-bold' }}
            className={css.tabContent}
            icon="nav-settings"
            padding="large"
          >
            {getString('ce.anomalyDetection.settings.options.header')}
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
              {getString('ce.anomalyDetection.settings.heading')}
            </Text>
          </li>
        </ul>
      </Container>
    </Layout.Horizontal>
  )
}

export default AnomaliesSettings
