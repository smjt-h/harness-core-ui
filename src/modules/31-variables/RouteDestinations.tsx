/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, variablePathProps } from '@common/utils/routeUtils'

import { AccountSideNavProps } from '@common/RouteDestinations'
import AuditTrailFactory from '@audit-trail/factories/AuditTrailFactory'
import VariablesPage from './pages/variables/VariablesPage'

const platformLabel = 'auditTrail.Platform'
AuditTrailFactory.registerResourceHandler('VARIABLE', {
  moduleIcon: {
    name: 'variable'
  },
  moduleLabel: platformLabel,
  resourceLabel: 'common.variables'
})

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toVariables({ ...accountPathProps })} exact>
      <VariablesPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toVariableDetails({ ...accountPathProps, ...variablePathProps })}
      exact
    >
      {/* TODO */}
    </RouteWithLayout>
  </>
)
