/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Suspense, lazy } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { returnUrlParams } from '@common/utils/routeUtils'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'
import { useStrings } from 'framework/strings'
import AppStorage from 'framework/utils/AppStorage'
import { getLoginPageURL } from 'framework/utils/SessionUtils'

const RemoteSTOApp = lazy(() => import('sto/App'))

export const RemotePipelineSecurityView = lazy(() => import('sto/PipelineSecurityView'))
export const RemoteOverviewView = lazy(() => import('sto/OverviewView'))

export const STORemoteComponentMounter = props => {
  const { spinner, component } = props
  const { getString } = useStrings()
  const { path, params } = useRouteMatch()
  const history = useHistory()

  return (
    <Suspense fallback={spinner || <Container padding="large">{getString('loading')}</Container>}>
      <AppErrorBoundary>
        <RemoteSTOApp
          baseRoutePath={path}
          accountId={params.accountId}
          apiToken={AppStorage.get('token')}
          on401={() => {
            AppStorage.clear()
            history.push({
              pathname: routes.toRedirect(),
              search: returnUrlParams(getLoginPageURL({ returnUrl: window.location.href }))
            })
          }}
          hooks={{}}
          components={{}}
        >
          {component}
        </RemoteSTOApp>
      </AppErrorBoundary>
    </Suspense>
  )
}
