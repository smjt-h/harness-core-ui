/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useContext } from 'react'
import type { Breadcrumb } from '@harness/uicore'

export interface DashboardsContextProps {
  breadcrumbs: Breadcrumb[]
  includeBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
}

const DashboardsContext = React.createContext<DashboardsContextProps>({} as DashboardsContextProps)

export function DashboardsContextProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])

  const includeBreadcrumbs = (breadcrumbsToAdd: Breadcrumb[]): void => {
    setBreadcrumbs(breadcrumbsToAdd)
  }

  return (
    <DashboardsContext.Provider
      value={{
        breadcrumbs,
        includeBreadcrumbs
      }}
    >
      {props.children}
    </DashboardsContext.Provider>
  )
}

export function useDashboardsContext(): DashboardsContextProps {
  return useContext(DashboardsContext)
}
