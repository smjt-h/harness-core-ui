import React, { useEffect, useState } from 'react'
import {
  Container,
  Layout,
  Page,
  Button,
  ButtonVariation,
  PageSpinner,
  ExpandingSearchInput,
  Checkbox,
  useToaster
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { triggerFullSyncPromise, useListFullSyncFiles } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { setPageNumber } from '@common/utils/utils'
import GitFullSyncEntityList from './GitFullSyncEntityList'

const GitSyncConfigTab: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [showOnlyFailed, setShowOnlyFailed] = useState(false)

  const {
    data: fullSyncEntities,
    loading,
    refetch
  } = useListFullSyncFiles({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pageIndex: page,
      pageSize: 10,
      syncStatus: showOnlyFailed ? 'FAILED' : undefined,
      searchTerm
    },
    debounce: 500
  })

  const handleReSync = async (): Promise<void> => {
    const triggerFullSync = await triggerFullSyncPromise({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      body: undefined
    })
    refetch()

    if (triggerFullSync.status === 'SUCCESS') {
      showSuccess('Resync triggered')
    } else {
      showError((triggerFullSync as Error)?.message || 'Resync failed')
    }
  }

  useEffect(() => {
    setPageNumber({ setPage, page, pageItemsCount: fullSyncEntities?.data?.pageItemCount })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullSyncEntities?.data])

  useEffect(() => {
    refetch()
  }, [searchTerm, page, showOnlyFailed, refetch])

  //   const mockData: GitFullSyncEntityInfoDTO[] = [
  //     {
  //       accountIdentifier: accountId,
  //       branch: 'master',
  //       entityType: 'Connectors',
  //       filePath: 'connectors/dummy.yaml',
  //       name: 'dummy',
  //       orgIdentifier,
  //       projectIdentifier,
  //       repoName: 'repoOne',
  //       retryCount: 0,
  //       syncStatus: 'SUCCESS'
  //     },
  //     {
  //       accountIdentifier: accountId,
  //       branch: 'master',
  //       entityType: 'Pipelines',
  //       filePath: 'pipelines/abc.yaml',
  //       name: 'abc',
  //       orgIdentifier,
  //       projectIdentifier,
  //       repoName: 'repoOne',
  //       retryCount: 0,
  //       syncStatus: 'SUCCESS'
  //     },
  //     {
  //       accountIdentifier: accountId,
  //       branch: 'master',
  //       entityType: 'Template',
  //       filePath: 'template.yaml',
  //       name: 'template',
  //       orgIdentifier,
  //       projectIdentifier,
  //       repoName: 'repoOne',
  //       retryCount: 0,
  //       syncStatus: 'FAILED'
  //     },
  //     {
  //       accountIdentifier: accountId,
  //       branch: 'dev',
  //       entityType: 'Pipelines',
  //       filePath: 'pipeline.yaml',
  //       name: 'pipeline',
  //       orgIdentifier,
  //       projectIdentifier,
  //       repoName: 'repoOne',
  //       retryCount: 0,
  //       syncStatus: 'QUEUED'
  //     },
  //     {
  //       accountIdentifier: accountId,
  //       branch: 'dev',
  //       entityType: 'InputSets',
  //       filePath: 'inputSet.yaml',
  //       name: 'inputSet',
  //       orgIdentifier,
  //       projectIdentifier,
  //       repoName: 'repoOne',
  //       retryCount: 0,
  //       syncStatus: 'FAILED'
  //     }
  //   ]
  //   const mockResponse = {
  //     content: mockData,
  //     empty: false,
  //     pageIndex: 0,
  //     pageItemCount: 4,
  //     pageSize: 10,
  //     totalItems: 5,
  //     totalPages: 1
  //   }

  return (
    <>
      <Page.SubHeader>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }} width={'100%'}>
          <Layout.Horizontal spacing="medium">
            <Container border padding={{ top: 'xsmall', right: 'small', bottom: 'xsmall', left: 'small' }}>
              <Checkbox
                disabled={loading}
                name="syncFailedFilter"
                label={'Sync Failed'}
                onChange={e => {
                  setShowOnlyFailed(!!e.currentTarget.checked)
                }}
              />
            </Container>
          </Layout.Horizontal>
          <Layout.Horizontal spacing="medium">
            <ExpandingSearchInput
              alwaysExpanded
              width={250}
              placeholder={getString('search')}
              throttle={200}
              onChange={text => {
                setSearchTerm(text.trim())
                setPage(0)
              }}
            />
            <Button
              variation={ButtonVariation.SECONDARY}
              text={'Resync Failed Entities'}
              disabled={loading}
              onClick={handleReSync}
            ></Button>
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Page.SubHeader>
      <Page.Body>
        {loading ? (
          <PageSpinner />
        ) : fullSyncEntities?.data?.totalItems ? (
          <Container padding="xlarge">
            <GitFullSyncEntityList
              data={fullSyncEntities?.data}
              gotoPage={(pageNumber: number) => setPage(pageNumber)}
            />
          </Container>
        ) : (
          <Page.NoDataCard message={getString('noData')} />
        )}
      </Page.Body>
    </>
  )
}

export default GitSyncConfigTab
