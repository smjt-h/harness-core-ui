/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Button,
  ButtonVariation,
  Color,
  Container,
  getErrorInfoFromErrorObject,
  Icon,
  IconName,
  Layout,
  Text,
  useToaster
} from '@harness/uicore'

import cx from 'classnames'
import type { Column, CellProps, Renderer } from 'react-table'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import {
  CCMNotificationSetting,
  CCMPerspectiveNotificationChannelsDTO,
  useDeleteNotificationSettings,
  useListNotificationSettings
} from 'services/ce'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import useAnomaliesAlertDialog from '../AnomaliesAlert/AnomaliesAlertDialog'
import Table from '../PerspectiveReportsAndBudget/Table'
import css from './AnomaliesSettings.module.scss'

const AlertsSection = () => {
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { accountId } = useParams<AccountPathProps>()
  const [isRefetching, setRefetchingState] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const { openAnomaliesAlertModal } = useAnomaliesAlertDialog({
    setRefetchingState: setRefetchingState,
    selectedAlert: selectedAlert
  })

  const {
    data: notificationsList,
    loading,
    refetch: fetchNotificationList
  } = useListNotificationSettings({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: deleteNotificationAlert } = useDeleteNotificationSettings({
    queryParams: {
      accountIdentifier: accountId,
      perspectiveId: ''
    }
  })

  useEffect(() => {
    if (isRefetching) {
      fetchNotificationList()
      setRefetchingState(false)
    }
  }, [fetchNotificationList, isRefetching])

  useEffect(() => {
    if (selectedAlert) {
      openAnomaliesAlertModal()
    }
  }, [openAnomaliesAlertModal, selectedAlert])

  const channelImgMap = {
    SLACK: 'service-slack',
    EMAIL: 'email-inline',
    MICROSOFT_TEAMS: 'service-msteams',
    DEFAULT: ''
  }

  const alertData = notificationsList?.data || []

  const deleteNotification = async (perspectiveId: string) => {
    try {
      const response = await deleteNotificationAlert(void 0, {
        queryParams: {
          accountIdentifier: accountId,
          perspectiveId: perspectiveId
        },
        headers: {
          'content-type': 'application/json'
        }
      })
      setRefetchingState(true)
      response && showSuccess(getString('ce.anomalyDetection.notificationAlerts.deleteAlertSuccessMsg'))
    } catch (error) {
      showError(getErrorInfoFromErrorObject(error))
    }
  }

  const onEdit = (notificationData: any) => {
    setSelectedAlert(notificationData)
  }

  const actionCell: Renderer<CellProps<CCMNotificationSetting>> = ({ row }) => {
    const perspectiveId = row.original.perspectiveId || ''

    return (
      <Layout.Horizontal spacing="medium">
        <Icon name="Edit" size={16} color={Color.PRIMARY_6} onClick={() => onEdit(row.original)} />
        <Icon name="main-trash" size={16} color={Color.PRIMARY_6} onClick={() => deleteNotification(perspectiveId)} />
      </Layout.Horizontal>
    )
  }

  const ChannelsCell: Renderer<CellProps<CCMNotificationSetting>> = ({ row }) => {
    const channelsList = row.original.channels || []

    // TODO: Need the check the styling
    return (
      <Layout.Vertical spacing="medium">
        {channelsList.map((channel, index) => {
          const channelType = channel?.notificationChannelType || 'DEFAULT'
          const channelCount = channel.channelUrls?.length || 0

          return (
            <Layout.Horizontal spacing="small" key={index}>
              <Icon name={channelImgMap[channelType] as IconName} size={16} />
              <Text>{channel?.channelUrls?.[0]}</Text>
              {/* TODO: Need to implement the on hover implementation */}
              {channelCount > 1 ? <Text>{`(+${channelCount - 1})`}</Text> : null}
            </Layout.Horizontal>
          )
        })}
      </Layout.Vertical>
    )
  }

  const columns: Column<CCMPerspectiveNotificationChannelsDTO>[] = React.useMemo(
    () => [
      {
        Header: getString('ce.anomalyDetection.settings.perspectiveNameColumn'),
        accessor: 'perspectiveName',
        width: '42%'
      },
      {
        Header: getString('ce.anomalyDetection.tableHeaders.details'),
        width: '50%',
        Cell: ChannelsCell
      },
      {
        Header: ' ',
        Cell: actionCell,
        width: '8%'
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
      {!loading && alertData.length ? (
        <Container className={css.tableView}>
          <Table<CCMPerspectiveNotificationChannelsDTO> columns={columns} data={alertData} />
        </Container>
      ) : null}
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
