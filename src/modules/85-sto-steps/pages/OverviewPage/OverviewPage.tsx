/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import OverviewView from '@sto/OverviewView'

export default function OverviewPage(): React.ReactElement | null {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()

  return (
    <Container width="100%" height="100%">
      <OverviewView
        accountId={accountId}
        module={module}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
      />
    </Container>
  )
}
