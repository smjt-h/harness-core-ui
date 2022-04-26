import React, { useState } from 'react'
import { ButtonVariation, NoDataCard, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import noDataNotifications from '@cv/assets/noDataNotifications.svg'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import SRMNotificationTable, { NotificationRulesItem } from './components/SRMNotificationTable'
import css from './NotificationsContainer.module.scss'

const data: NotificationRulesItem[] = []
const PAGE_SIZE = 10

export default function NotificationsContainer(): JSX.Element {
  const { projectIdentifier } = useParams<ProjectPathProps & { identifier: string }>()
  const [page, setPage] = useState(0)

  const getAddNotificationButton = (): JSX.Element => (
    <RbacButton
      icon="plus"
      text={'New Notification Rule'}
      variation={ButtonVariation.PRIMARY}
      onClick={() => {}}
      // className={getClassNameForMonitoredServicePage(css.createSloInMonitoredService, monitoredService?.identifier)}
      permission={{
        permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
        resource: {
          resourceType: ResourceType.MONITOREDSERVICE,
          resourceIdentifier: projectIdentifier
        }
      }}
    />
  )

  return (
    <CardWithOuterTitle className={css.notificationsContainer}>
      <Text tooltipProps={{ dataTooltipId: 'healthSourcesLabel' }} className={css.tableTitle}>
        Notifications
      </Text>
      <SRMNotificationTable
        data={data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}
        // getExistingNotificationNames={(skipIndex?: number): string[] => {
        //   return allRowsData.filter(item => item.index !== skipIndex).map(item => item.notificationRules.name!)
        // }}
        pageIndex={page}
        totalPages={Math.ceil(data.length / PAGE_SIZE)}
        pageItemCount={PAGE_SIZE}
        pageSize={PAGE_SIZE}
        totalItems={data.length}
        gotoPage={index => {
          setPage(index)
        }}
        onUpdate={(notificationItem, action, closeModal) => {}}
      />

      {!data.length ? (
        <>
          <NoDataCard
            image={noDataNotifications}
            containerClassName={css.notificationsNoData}
            message={'There are no notifications'}
            button={getAddNotificationButton()}
          />
        </>
      ) : null}
    </CardWithOuterTitle>
  )
}
