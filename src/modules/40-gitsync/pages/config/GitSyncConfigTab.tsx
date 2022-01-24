/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import {
  Container,
  Layout,
  Page,
  Button,
  ButtonVariation,
  PageSpinner,
  ExpandingSearchInput,
  Checkbox,
  useToaster,
  MultiSelectDropDown,
  SelectOption,
  MultiSelectOption
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import debounce from 'p-debounce'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  GitFullSyncEntityInfoFilterKeys,
  PageGitFullSyncEntityInfoDTO,
  triggerFullSyncPromise,
  useListFullSyncFiles
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { setPageNumber } from '@common/utils/utils'
import { Entities } from '@common/interfaces/GitSyncInterface'
import GitFullSyncEntityList from './GitFullSyncEntityList'
import css from './GitSyncConfigTab.module.scss'

const debounceWait = 500

const enum SyncStatus {
  QUEUED = 'QUEUED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  OVERRIDDEN = 'OVERRIDDEN'
}

const supportedGitEntities: SelectOption[] = [
  {
    label: 'CONNECTORS',
    value: defaultTo(Entities.CONNECTORS, '')
  },
  {
    label: 'PIPELINES',
    value: defaultTo(Entities.PIPELINES, '')
  },
  {
    label: 'INPUT_SETS',
    value: defaultTo(Entities.INPUT_SETS, '')
  },
  {
    label: 'TEMPLATE',
    value: defaultTo(Entities.TEMPLATE, '')
  }
]

const GitSyncConfigTab: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const [fullSyncEntities, setFullSyncEntities] = useState<PageGitFullSyncEntityInfoDTO | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [showOnlyFailed, setShowOnlyFailed] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<MultiSelectOption[]>()

  const { mutate: getFullSyncFiles, loading } = useListFullSyncFiles({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pageIndex: page,
      pageSize: 10,
      searchTerm
    }
  })

  const debouncedGetFullSyncFiles = useCallback(
    debounce(() => {
      return getFullSyncFiles({
        syncStatus: showOnlyFailed ? SyncStatus.FAILED : undefined,
        entityTypes: selectedEntity?.map(
          (option: MultiSelectOption) => option.value
        ) as GitFullSyncEntityInfoFilterKeys['entityTypes']
      })
    }, debounceWait),
    [getFullSyncFiles, showOnlyFailed, debounceWait, selectedEntity]
  )

  useEffect(() => {
    setPageNumber({ setPage, page, pageItemsCount: fullSyncEntities?.pageItemCount })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullSyncEntities])

  useEffect(() => {
    debouncedGetFullSyncFiles().then(response => setFullSyncEntities(response.data))
  }, [searchTerm, page, showOnlyFailed, selectedEntity, debouncedGetFullSyncFiles])

  const handleReSync = async (): Promise<void> => {
    const triggerFullSync = await triggerFullSyncPromise({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      body: undefined
    })
    setFullSyncEntities((await debouncedGetFullSyncFiles()).data)

    if (triggerFullSync.status === 'SUCCESS') {
      showSuccess(getString('gitsync.resyncSucessToaster'))
    } else {
      showError((triggerFullSync as Error)?.message || getString('gitsync.resyncFailToaster'))
    }
  }

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
            <MultiSelectDropDown
              buttonTestId={'entityTypeFilter'}
              value={selectedEntity}
              width={200}
              items={supportedGitEntities}
              usePortal={true}
              placeholder={'Entity Type'}
              className={css.entityTypeFilter}
              onChange={setSelectedEntity}
            />
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
              text={getString('gitsync.resyncButtonText')}
              disabled={loading}
              onClick={handleReSync}
            ></Button>
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Page.SubHeader>
      <Page.Body>
        {loading ? (
          <PageSpinner />
        ) : fullSyncEntities?.totalItems ? (
          <Container padding="xlarge">
            <GitFullSyncEntityList data={fullSyncEntities} gotoPage={(pageNumber: number) => setPage(pageNumber)} />
          </Container>
        ) : (
          <Page.NoDataCard message={getString('noData')} />
        )}
      </Page.Body>
    </>
  )
}

export default GitSyncConfigTab
