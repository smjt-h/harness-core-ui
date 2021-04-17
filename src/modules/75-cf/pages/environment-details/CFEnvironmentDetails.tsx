import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Container } from '@wings-software/uicore'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { PageError } from '@common/components/Page/PageError'
import { useSyncedEnvironment } from '@cf/hooks/useSyncedEnvironment'
import { getErrorMessage } from '@cf/utils/CFUtils'
import CFEnvironmentDetailsHeader from './CFEnvironmentDetailsHeader'
import CFEnvironmentDetailsBody from './CFEnvironmentDetailsBody'

// eslint-disable-next-line @typescript-eslint/ban-types
const CFEnvironmentDetails: React.FC<{}> = () => {
  const { projectIdentifier, environmentIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { loading, data, error, refetch } = useSyncedEnvironment({
    accountId,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier
  })
  const environment = data?.data as EnvironmentResponseDTO
  const hasData = Boolean(environment)

  return (
    <>
      {hasData && (
        <Layout.Vertical height="100vh" style={{ boxSizing: 'border-box', background: '#FDFDFD' }}>
          <CFEnvironmentDetailsHeader environment={environment} />
          <CFEnvironmentDetailsBody environment={environment} />
        </Layout.Vertical>
      )}
      {loading && (
        <Container
          style={{
            position: 'fixed',
            top: '144px',
            left: '270px',
            width: 'calc(100% - 270px)',
            height: 'calc(100% - 144px)'
          }}
        >
          <ContainerSpinner />
        </Container>
      )}
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

export default CFEnvironmentDetails
