/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { PAGE_NAME } from './PageName'

export interface PageContext {
  pageName?: PAGE_NAME
}

const PageContext = React.createContext<PageContext>({})

export function usePage(): PageContext {
  return React.useContext(PageContext)
}

export default function PageProvider(props: React.PropsWithChildren<PageContext>): React.ReactElement {
  const { children, ...value } = props

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>
}
