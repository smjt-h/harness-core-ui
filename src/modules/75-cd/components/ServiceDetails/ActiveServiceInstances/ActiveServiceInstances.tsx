/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, Layout, Tab, Tabs } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ActiveServiceInstancesHeader } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancesHeader'
import {
  GetEnvArtifactDetailsByServiceIdQueryParams,
  GetEnvBuildInstanceCountQueryParams,
  useGetEnvArtifactDetailsByServiceId,
  useGetEnvBuildInstanceCount
} from 'services/cd-ng'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { ActiveServiceInstancesContent } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancesContent'
import { Deployments } from '../DeploymentView/DeploymentView'
import css from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstances.module.scss'

export enum ServiceDetailTabs {
  ACTIVE = 'Active Service Instances',
  DEPLOYMENT = 'Deployments'
}

export const ActiveServiceInstances: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const queryParams: GetEnvBuildInstanceCountQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId
  }

  const {
    data: activeInstancedata,
    loading: loadingActiveInstance,
    error: errorActiveInstance
  } = useGetEnvBuildInstanceCount({ queryParams })

  const queryParamsDeployments: GetEnvArtifactDetailsByServiceIdQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId
  }

  const {
    data: deploymentData,
    loading: loadingDeployment,
    error: errorDeployment
  } = useGetEnvArtifactDetailsByServiceId({ queryParams: queryParamsDeployments })

  const deploymentState = (): boolean => {
    if (loadingDeployment || errorDeployment || !(deploymentData?.data?.environmentInfoByServiceId || []).length)
      return false
    return true
  }

  const activeInstanceState = (): boolean => {
    if (
      loadingActiveInstance ||
      errorActiveInstance ||
      !(activeInstancedata?.data?.envBuildIdAndInstanceCountInfoList || []).length
    )
      return false
    return true
  }

  const activeState = (): boolean => {
    if (deploymentState() && !activeInstanceState()) {
      return false
    }
    return true
  }
  return (
    <Card className={css.activeServiceInstances}>
      <Layout.Vertical className={css.tabsStyle}>
        <Tabs
          id="ServiceDetailTabs"
          defaultSelectedTabId={activeState() ? ServiceDetailTabs.ACTIVE : ServiceDetailTabs.DEPLOYMENT}
        >
          <Tab
            id={ServiceDetailTabs.ACTIVE}
            title={getString('cd.serviceDashboard.activeServiceInstancesLabel')}
            panel={
              <>
                <ActiveServiceInstancesHeader />
                <ActiveServiceInstancesContent />
              </>
            }
          />
          <Tab id={ServiceDetailTabs.DEPLOYMENT} title={getString('deploymentsText')} panel={<Deployments />} />
        </Tabs>
      </Layout.Vertical>
    </Card>
  )
}
