/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { Tab, Tabs, Page, Container, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useGetSegment, Segment, Feature } from 'services/cf'
import { useGetEnvironment } from 'services/cd-ng'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import StringWithTooltip from '@common/components/StringWithTooltip/StringWithTooltip'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import routes from '@common/RouteDefinitions'
import { AuditLogObjectType, formatDate, formatTime } from '@cf/utils/CFUtils'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { useGitSync } from '@cf/hooks/useGitSync'
import TargetManagementToolbar from '@cf/components/TargetManagementToolbar/TargetManagementToolbar'
import { AuditLogs } from '@cf/components/AuditLogs/AuditLogs'
import { DetailPageTemplate } from '@cf/components/DetailPageTemplate/DetailPageTemplate'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import TargetGroupCriteria from './components/TargetGroupCriteria'
import FlagSettingsPanel from './components/FlagSettingsPanel/FlagSettingsPanel'
import useDeleteTargetGroupDialog from './hooks/useDeleteTargetGroupDialog'

import css from './TargetGroupDetailPage.module.scss'

const TargetGroupDetailPage: FC = () => {
  const { getString } = useStrings()
  const { withActiveEnvironment, activeEnvironment: environmentIdentifier } = useActiveEnvironment()
  const gitSync = useGitSync()

  useDocumentTitle(`${getString('cf.shared.targetManagement')}: ${getString('cf.shared.segments')}`)

  const {
    accountId: accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    segmentIdentifier
  } = useParams<Record<string, string>>()

  const {
    data: targetGroup,
    loading: targetGroupLoading,
    error: targetGroupError,
    refetch: refetchTargetGroup
  } = useGetSegment({
    identifier: segmentIdentifier,
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier
    }
  })

  const {
    data: envData,
    loading: envLoading,
    error: envError,
    refetch: refetchEnv
  } = useGetEnvironment({
    environmentIdentifier,
    queryParams: {
      accountId: accountIdentifier,
      orgIdentifier,
      projectIdentifier
    }
  })

  const deleteTargetGroupDialog = useDeleteTargetGroupDialog(targetGroup as Segment)

  const breadcrumbs = [
    {
      label: `${getString('cf.shared.targetManagement')}: ${getString('cf.shared.segments')}`,
      url: withActiveEnvironment(
        routes.toCFSegments({
          accountId: accountIdentifier,
          orgIdentifier,
          projectIdentifier
        })
      )
    }
  ]

  if (targetGroupLoading || envLoading) {
    return <ContainerSpinner flex={{ align: 'center-center' }} />
  }

  if (targetGroupError || envError) {
    return (
      <Page.Error
        message={targetGroupError?.message || envError?.message}
        onClick={async () => {
          await Promise.all([refetchTargetGroup(), refetchEnv()])
        }}
      />
    )
  }

  return (
    <DetailPageTemplate
      breadcrumbs={breadcrumbs}
      title={targetGroup?.name}
      subTitle={getString('cf.targetDetail.createdOnDate', {
        date: formatDate(targetGroup?.createdAt as number),
        time: formatTime(targetGroup?.createdAt as number)
      })}
      identifier={targetGroup?.identifier}
      menuItems={[
        {
          icon: 'cross',
          text: getString('delete'),
          onClick: deleteTargetGroupDialog,
          permission: {
            resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: targetGroup?.identifier },
            permission: PermissionIdentifier.DELETE_FF_TARGETGROUP
          }
        }
      ]}
      metaData={{ environment: envData?.data?.name as string }}
    >
      <Layout.Vertical height="100%">
        {gitSync.isGitSyncActionsEnabled && <TargetManagementToolbar gitSync={gitSync} />}

        <Container className={css.layout}>
          <TargetGroupCriteria targetGroup={targetGroup as Segment} reloadTargetGroup={refetchTargetGroup} />

          <Tabs id="TargetGroupDetailPageTabs">
            <Tab
              id="FlagSettingsTab"
              title={
                <StringWithTooltip
                  stringId="cf.targetDetail.flagSetting"
                  tooltipId="ff_targetGroupDetail_flagSettings_heading"
                />
              }
              panel={<FlagSettingsPanel targetGroup={targetGroup as Segment} />}
              panelClassName={css.panel}
            />
            <Tab
              id="AuditLogsTab"
              title={getString('activityLog')}
              panel={<AuditLogs flagData={targetGroup as Feature} objectType={AuditLogObjectType.Segment} />}
              panelClassName={css.panel}
            />
          </Tabs>
        </Container>
      </Layout.Vertical>
    </DetailPageTemplate>
  )
}

export default TargetGroupDetailPage
