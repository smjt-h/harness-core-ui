/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { PageError } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { useSyncedEnvironment } from '@cf/hooks/useSyncedEnvironment'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cf/utils/CFUtils'
import AddKeyDialog from '@cf/components/AddKeyDialog/AddKeyDialog'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { DetailPageTemplate } from '@cf/components/DetailPageTemplate/DetailPageTemplate'
import CFEnvironmentDetailsBody from './EnvironmentDetailsBody'

const EnvironmentDetails: React.FC = () => {
  const { getString } = useStrings()
  const { projectIdentifier, environmentIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { withActiveEnvironment } = useActiveEnvironment()

  const { loading, data, error, refetch } = useSyncedEnvironment({
    accountId,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier
  })
  const environment = data?.data as EnvironmentResponseDTO
  const hasData = Boolean(environment)

  useDocumentTitle(getString('environments'))

  const breadcrumbs = [
    {
      label: getString('environments'),
      url: withActiveEnvironment(
        routes.toCFEnvironments({
          accountId,
          orgIdentifier,
          projectIdentifier
        })
      )
    }
  ]

  return (
    <>
      {hasData && (
        <DetailPageTemplate
          breadcrumbs={breadcrumbs}
          title={environment.name}
          identifier={environment.identifier}
          subTitle={environment.description}
          metaData={{
            environment: getString(environment.type === EnvironmentType.PRODUCTION ? 'production' : 'nonProduction')
          }}
          subheader={
            <AddKeyDialog
              environment={environment}
              onCreate={(newKey, hideModal) => {
                console.log(newKey)
                hideModal()
              }}
            />
          }
        >
          <CFEnvironmentDetailsBody environment={environment} />
        </DetailPageTemplate>
      )}
      {loading && <ContainerSpinner flex={{ align: 'center-center' }} />}
      {error && (
        <PageError
          message={getErrorMessage(error)}
          onClick={() => {
            refetch()
          }}
        />
      )}
    </>
  )
}

export default EnvironmentDetails
