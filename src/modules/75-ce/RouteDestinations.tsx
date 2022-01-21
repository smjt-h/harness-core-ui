/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route, useParams, Redirect, Switch } from 'react-router-dom'
import { createClient, Provider, dedupExchange, cacheExchange, fetchExchange } from 'urql'
import { requestPolicyExchange } from '@urql/exchange-request-policy'
import routes from '@common/RouteDefinitions'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { accountPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { AccountPathProps, Module, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import { MinimalLayout } from '@common/layouts'
import SessionToken from 'framework/utils/SessionToken'

import CESideNav from '@ce/components/CESideNav/CESideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { getConfig } from 'services/config'
import { LicenseRedirectProps, LICENSE_STATE_NAMES } from 'framework/LicenseStore/LicenseStoreContext'
import CEHomePage from './pages/home/CEHomePage'
// import CEDashboardPage from './pages/dashboard/CEDashboardPage'
import CECODashboardPage from './pages/co-dashboard/CECODashboardPage'
import CECOCreateGatewayPage from './pages/co-create-gateway/CECOCreateGatewayPage'
import CECOEditGatewayPage from './pages/co-edit-gateway/CECOEditGatewayPage'
import CECOLoadBalancersPage from './pages/co-access-points/CECOAccessPointsPage'
import Budgets from './pages/budgets/Budgets'
import CETrialHomePage from './pages/home/CETrialHomePage'

import RecommendationList from './pages/recommendationList/RecommendationList'
import RecommendationDetailsPage from './pages/recommendationDetails/RecommendationDetailsPage'
import PerspectiveDetailsPage from './pages/perspective-details/PerspectiveDetailsPage'
import CreatePerspectivePage from './pages/perspective-builder/CreatePerspectivePage'
import PerspectiveListPage from './pages/perspective-list/PerspectiveListPage'
import WorkloadDetailsPage from './pages/workload-details/WorkloadDetailsPage'
import OverviewPage from './pages/overview/OverviewPage'
import NodeRecommendationDetailsPage from './pages/node-recommendation-details/NodeRecommendationDetailsPage'
import BudgetDetails from './pages/budget-details/BudgetDetails'
import NodeDetailsPage from './pages/node-details/NodeDetailsPage'

const CESideNavProps: SidebarContext = {
  navComponent: CESideNav,
  subtitle: 'CLOUD COST',
  title: 'Management',
  icon: 'ce-main'
}

const RedirectToModuleTrialHome = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toModuleTrialHome({
        accountId,
        module: 'ce'
      })}
    />
  )
}

const RedirectToSubscriptions = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toSubscriptions({
        accountId,
        moduleCard: ModuleName.CE.toLowerCase() as Module
      })}
    />
  )
}

const RedirectToOverview = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toCEOverview({
        accountId,
        module: 'ce'
      })}
    />
  )
}

const ceModuleParams: ModulePathParams = {
  module: ':module(ce)'
}

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.CCM_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHome,
  expiredTrialRedirect: RedirectToSubscriptions
}

const CERoutes: React.FC = () => {
  const token = SessionToken.getToken()
  const { accountId } = useParams<AccountPathProps>()

  const getRequestOptions = React.useCallback((): Partial<RequestInit> => {
    const headers: RequestInit['headers'] = {}

    if (token && token.length > 0) {
      headers.Authorization = `Bearer ${token}`
    }

    return { headers }
  }, [token])

  const urqlClient = React.useCallback(() => {
    const url = getConfig(`ccm/api/graphql?accountIdentifier=${accountId}&routingId=${accountId}`)

    // if (url.startsWith('/')) {
    //   url = url.substr(1)
    // }
    return createClient({
      url: url,
      fetchOptions: () => {
        return getRequestOptions()
      },
      exchanges: [dedupExchange, requestPolicyExchange({}), cacheExchange, fetchExchange],
      requestPolicy: 'cache-first'
    })
  }, [token, accountId])

  return (
    <Provider value={urqlClient()}>
      <Switch>
        <RouteWithLayout
          layout={MinimalLayout}
          path={routes.toModuleTrialHome({ ...accountPathProps, module: 'ce' })}
          exact
        >
          <CETrialHomePage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          path={routes.toCEHome({ ...accountPathProps, ...ceModuleParams })}
          exact
        >
          <CEHomePage />
        </RouteWithLayout>
        <RouteWithLayout
          exact
          licenseRedirectData={licenseRedirectData}
          path={routes.toCE({ ...accountPathProps, ...ceModuleParams })}
        >
          <RedirectToOverview />
        </RouteWithLayout>

        {/* <RouteWithLayout
          sidebarProps={CESideNavProps}
          path={routes.toCEDashboard({ ...accountPathProps, ...projectPathProps })}
          exact
        >
          <CEDashboardPage />
        </RouteWithLayout> */}
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCECORules({ ...accountPathProps, ...ceModuleParams })}
          exact
        >
          <CECODashboardPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCECOCreateGateway({ ...accountPathProps, ...ceModuleParams })}
          exact
        >
          <CECOCreateGatewayPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCECOEditGateway({
            ...accountPathProps,
            gatewayIdentifier: ':gatewayIdentifier',
            ...ceModuleParams
          })}
          exact
        >
          <CECOEditGatewayPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCECOAccessPoints({ ...accountPathProps, ...ceModuleParams })}
          exact
        >
          <CECOLoadBalancersPage />
        </RouteWithLayout>

        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCEBudgets({ ...accountPathProps, ...ceModuleParams })}
          exact
        >
          <Budgets />
        </RouteWithLayout>

        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCEBudgetDetails({
            ...accountPathProps,
            ...ceModuleParams,
            budgetId: ':budgetId',
            budgetName: ':budgetName'
          })}
        >
          <BudgetDetails />
        </RouteWithLayout>

        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCERecommendations({ ...accountPathProps, ...ceModuleParams })}
          exact
        >
          <RecommendationList />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCERecommendationDetails({
            ...accountPathProps,
            ...ceModuleParams,
            recommendationName: ':recommendationName',
            recommendation: ':recommendation'
          })}
          exact
        >
          <RecommendationDetailsPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCENodeRecommendationDetails({
            ...accountPathProps,
            ...ceModuleParams,
            recommendationName: ':recommendationName',
            recommendation: ':recommendation'
          })}
          exact
        >
          <NodeRecommendationDetailsPage />
        </RouteWithLayout>
        <RouteWithLayout
          sidebarProps={CESideNavProps}
          path={routes.toPerspectiveDetails({
            ...accountPathProps,
            ...ceModuleParams,
            perspectiveId: ':perspectiveId',
            perspectiveName: ':perspectiveName'
          })}
          exact
        >
          <PerspectiveDetailsPage />
        </RouteWithLayout>

        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCECreatePerspective({
            ...accountPathProps,
            ...ceModuleParams,
            perspectiveId: ':perspectiveId'
          })}
          exact
        >
          <CreatePerspectivePage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCEPerspectives({
            ...accountPathProps,
            ...ceModuleParams
          })}
          exact
        >
          <PerspectiveListPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCEPerspectiveWorkloadDetails({
            ...accountPathProps,
            ...ceModuleParams,
            perspectiveId: ':perspectiveId',
            perspectiveName: ':perspectiveName',
            clusterName: ':clusterName',
            namespace: ':namespace',
            workloadName: ':workloadName'
          })}
          exact
        >
          <WorkloadDetailsPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCERecommendationWorkloadDetails({
            ...accountPathProps,
            ...ceModuleParams,
            recommendation: ':recommendation',
            recommendationName: ':recommendationName',
            clusterName: ':clusterName',
            namespace: ':namespace',
            workloadName: ':workloadName'
          })}
          exact
        >
          <WorkloadDetailsPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCEPerspectiveNodeDetails({
            ...accountPathProps,
            ...ceModuleParams,
            perspectiveId: ':perspectiveId',
            perspectiveName: ':perspectiveName',
            clusterName: ':clusterName',
            nodeId: ':nodeId'
          })}
          exact
        >
          <NodeDetailsPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCEOverview({ ...accountPathProps, ...ceModuleParams })}
          exact
        >
          <OverviewPage />
        </RouteWithLayout>

        <Route path="*">
          <NotFoundPage />
        </Route>
      </Switch>
    </Provider>
  )
}

export default CERoutes
