/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Container, Page, Tabs } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useGetSLODetails } from 'services/cv'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { getSearchString } from '@cv/utils/CommonUtils'
import CVCreateSLO from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO'
import HeaderTitle from './views/HeaderTitle'
import { SLODetailsPageTabIds } from './CVSLODetailsPage.types'
import css from './CVSLODetailsPage.module.scss'

const CVSLODetailsPage: React.FC = () => {
  const history = useHistory()
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const { tab = SLODetailsPageTabIds.Configurations, monitoredServiceIdentifier } =
    useQueryParams<{ tab?: SLODetailsPageTabIds; monitoredServiceIdentifier?: string }>()

  const { data, loading } = useGetSLODetails({
    identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  /* istanbul ignore next */
  const onTabChange = (nextTab: SLODetailsPageTabIds): void => {
    if (nextTab !== tab) {
      history.push({
        pathname: routes.toCVSLODetailsPage({
          identifier,
          accountId,
          orgIdentifier,
          projectIdentifier
        }),
        search: getSearchString({ tab: nextTab, monitoredServiceIdentifier })
      })
    }
  }

  const { description, sloDashboardWidget } = data?.data ?? {}
  const breadcrumbLinks = [
    {
      url: routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier }),
      label: getString('cv.SLO')
    }
  ]

  return (
    <div>
      <Page.Header
        size="large"
        title={<HeaderTitle loading={loading} title={sloDashboardWidget?.title} description={description} />}
        breadcrumbs={<NGBreadcrumbs links={breadcrumbLinks} />}
      />
      <Container className={css.tabContainer}>
        <Tabs
          id="slo-details-page-tabs"
          selectedTabId={tab}
          onChange={onTabChange}
          tabList={[
            {
              id: SLODetailsPageTabIds.Details,
              title: 'Details',
              disabled: true
            },
            {
              id: SLODetailsPageTabIds.Configurations,
              title: getString('cv.monitoredServices.monitoredServiceTabs.configurations'),
              panel: <CVCreateSLO />
            }
          ]}
        ></Tabs>
      </Container>
    </div>
  )
}

export default CVSLODetailsPage
