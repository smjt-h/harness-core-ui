/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { ServiceDetailsHeader } from '@cd/components/ServiceDetails/ServiceDetailsHeader/ServiceDetailsHeader'
import { ServiceResponseDTO, useGetServiceV2 } from 'services/cd-ng'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import ServiceConfigurationWrapper from './ServiceConfigWrapper/ServiceConfigWrapper'

function ServiceStudio(): React.ReactElement | null {
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()

  const { data: serviceResponse } = useGetServiceV2({
    serviceIdentifier: serviceId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  if (isEmpty(serviceResponse?.data?.service)) {
    return null
  }
  return (
    <Layout.Vertical>
      <ServiceDetailsHeader />
      <ServiceConfigurationWrapper serviceResponse={serviceResponse?.data?.service as ServiceResponseDTO} />
    </Layout.Vertical>
  )
}

export default ServiceStudio
