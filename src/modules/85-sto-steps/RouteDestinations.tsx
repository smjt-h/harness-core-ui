/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import CardRailView from '@pipeline/components/Dashboards/CardRailView/CardRailView'
import ExecutionCard from '@pipeline/components/ExecutionCard/ExecutionCard'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import STOSideNav from '@sto-steps/components/STOSideNav/STOSideNav'
import '@sto-steps/components/PipelineStages/SecurityStage'

const STOApp = React.lazy(() => import('sto/App')) // eslint-disable-line import/no-unresolved

const STOSideNavProps: SidebarContext = {
  navComponent: STOSideNav,
  title: 'Security Tests',
  icon: 'sto-color-filled'
}

const RedirectToProjectOverviewPage = (): React.ReactElement => {
  const { accountId } = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject) {
    return (
      <Redirect
        to={routes.toSTOProjectOverview({
          accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier
        })}
      />
    )
  } else {
    return <Redirect to={routes.toSTOOverview({ accountId })} />
  }
}

export default (
  <>
    <RouteWithLayout
      // licenseRedirectData={licenseRedirectData}
      path={routes.toSTO({ ...accountPathProps })}
      exact
    >
      <RedirectToProjectOverviewPage />
    </RouteWithLayout>

    <RouteWithLayout
      // licenseRedirectData={licenseRedirectData}
      sidebarProps={STOSideNavProps}
      path={[
        routes.toSTOOverview({ ...accountPathProps }),
        routes.toSTOProjectOverview({ ...accountPathProps, ...projectPathProps })
      ]}
    >
      <ChildAppMounter ChildApp={STOApp} customComponents={{ ExecutionCard, CardRailView }} />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={STOSideNavProps}
      path={[
        routes.toSTOTargets({ ...accountPathProps }),
        routes.toSTOProjectTargets({ ...accountPathProps, ...projectPathProps })
      ]}
    >
      <ChildAppMounter ChildApp={STOApp} />
    </RouteWithLayout>
  </>
)
