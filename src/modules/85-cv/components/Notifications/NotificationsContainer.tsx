/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetNotificationRuleData } from 'services/cv'
import SRMNotificationTable from './components/SRMNotificationTable/SRMNotificationTable'
import css from './NotificationsContainer.module.scss'

const PAGE_SIZE = 10

interface NotificationsContainerProps {
  children: JSX.Element
}

export default function NotificationsContainer(props: NotificationsContainerProps): JSX.Element {
  const { children } = props
  const { projectIdentifier, accountId, orgIdentifier } = useParams<ProjectPathProps & { identifier: string }>()
  const [page, setPage] = useState(0)

  // Todo this data will be coming as part of monitored service yaml.
  const {
    data
    // loading,
    // error
  } = useGetNotificationRuleData({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      pageNumber: page,
      pageSize: PAGE_SIZE
    }
  })

  const notificationData = data?.data?.content || []

  return (
    <CardWithOuterTitle className={css.notificationsContainer}>
      <Text tooltipProps={{ dataTooltipId: 'healthSourcesLabel' }} className={css.tableTitle}>
        Notifications
      </Text>
      <SRMNotificationTable
        data={notificationData?.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}
        notificationRulesComponent={children}
        // getExistingNotificationNames={(skipIndex?: number),[] => {
        //   return allRowsData.filter(item => item.index !== skipIndex).map(item => item.notificationRules.name!)
        // }}
        pageIndex={page}
        totalPages={Math.ceil(notificationData.length / PAGE_SIZE)}
        pageItemCount={PAGE_SIZE}
        pageSize={PAGE_SIZE}
        totalItems={notificationData.length}
        gotoPage={index => {
          setPage(index)
        }}
        // onUpdate={(notificationItem, action, closeModal) => {}}
      />
    </CardWithOuterTitle>
  )
}
