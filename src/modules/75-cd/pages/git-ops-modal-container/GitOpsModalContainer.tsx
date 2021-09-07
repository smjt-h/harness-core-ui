import React, { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { GetDataError } from 'restful-react'
import { HarnessDocTooltip, Layout, useModalHook, ExpandingSearchInput, Container } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'

import { removeNullAndEmpty } from '@common/components/Filter/utils/FilterUtils'
import { shouldShowError } from '@common/utils/errorUtils'

import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'

import {
  useGetConnectorListV2,
  GetConnectorListV2QueryParams,
  FilterDTO,
  PageConnectorResponse,
  Failure,
  ConnectorFilterProperties
} from 'services/cd-ng'
import { Page, useToaster } from '@common/exports'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import NewProviderModal from './NewProviderModal/NewProviderModal'
import ProvidersGridView from './ProvidersGridView'

import css from './GitOpsModalContainer.module.scss'

const textIdentifier = 'gitOps'

const GitOpsModalContainer: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()

  const { selectedProject } = useAppStore()
  const project = selectedProject

  const [searchTerm, setSearchTerm] = useState('')
  const [activeProvider, setActiveProvider] = useState(null)
  const [page, setPage] = useState(0)
  const [appliedFilter, setAppliedFilter] = useState<FilterDTO | null>()
  const { showError } = useToaster()
  const [connectors, setConnectors] = useState<PageConnectorResponse | undefined>()
  const [loading, setLoading] = useState<boolean>(false)
  const [connectorFetchError, setConnectorFetchError] = useState<GetDataError<Failure | Error>>()
  const defaultQueryParams: GetConnectorListV2QueryParams = {
    pageIndex: page,
    pageSize: 10,
    projectIdentifier,
    orgIdentifier,
    accountIdentifier: accountId,
    searchTerm: ''
  }

  useDocumentTitle(getString('connectorsLabel'))

  React.useEffect(() => {
    if (activeProvider) {
      addNewProviderModal()
    }
  }, [activeProvider])

  const handleEdit = (provider: any) => {
    setActiveProvider(provider?.connector)
  }

  const { mutate: fetchConnectors } = useGetConnectorListV2({
    queryParams: defaultQueryParams
  })

  const refetchConnectorList = React.useCallback(
    async (
      params?: GetConnectorListV2QueryParams,
      filter?: ConnectorFilterProperties,
      needsRefinement = true
    ): Promise<void> => {
      setLoading(true)
      const { connectorNames, connectorIdentifiers, description, types, connectivityStatuses, tags } = filter || {}

      const requestBodyPayload = Object.assign(
        filter
          ? {
              connectorNames: typeof connectorNames === 'string' ? [connectorNames] : connectorNames,
              connectorIdentifiers:
                typeof connectorIdentifiers === 'string' ? [connectorIdentifiers] : connectorIdentifiers,
              description,
              types: needsRefinement ? types?.map(type => type?.toString()) : types,
              connectivityStatuses: needsRefinement
                ? connectivityStatuses?.map(status => status?.toString())
                : connectivityStatuses,
              tags
            }
          : {},
        {
          includeTypes: ['ArgoConnector'],
          filterType: 'Connector'
        }
      ) as ConnectorFilterProperties
      const sanitizedFilterRequest = removeNullAndEmpty(requestBodyPayload)
      try {
        const { status, data } = await fetchConnectors(sanitizedFilterRequest, { queryParams: params })
        /* istanbul ignore else */ if (status === 'SUCCESS') {
          setConnectors(data)
          setConnectorFetchError(undefined)
        }
      } /* istanbul ignore next */ catch (e) {
        if (shouldShowError(e)) {
          showError(e.data?.message || e.message)
        }
        setConnectorFetchError(e)
      }
      setLoading(false)
    },
    [fetchConnectors]
  )

  const [addNewProviderModal, closeNewProviderModal] = useModalHook(() => {
    const handleClose = () => {
      closeNewProviderModal()
      refetchConnectorList()
    }

    return (
      <Dialog
        onClose={handleClose}
        isOpen={true}
        style={{
          width: 'auto',
          minWidth: 1175,
          height: 640,
          borderLeft: 0,
          paddingBottom: 0,
          position: 'relative',
          overflow: 'auto'
        }}
        enforceFocus={false}
      >
        <NewProviderModal provider={activeProvider} onClose={handleClose} />
      </Dialog>
    )
  }, [activeProvider])

  /* Initial page load */
  useEffect(() => {
    refetchConnectorList({ ...defaultQueryParams, searchTerm, pageIndex: 0 })
    setPage(0)
  }, [projectIdentifier, orgIdentifier])

  /* Through page browsing */
  useEffect(() => {
    const updatedQueryParams = {
      ...defaultQueryParams,
      searchTerm,
      pageIndex: page
    }
    refetchConnectorList(updatedQueryParams, appliedFilter?.filterProperties)
  }, [page])

  /* Through expandable filter text search */
  const debouncedConnectorSearch = useCallback(
    debounce((query: string): void => {
      /* For a non-empty query string, always start from first page(index 0) */
      const updatedQueryParams = {
        ...defaultQueryParams,
        searchTerm: query,
        pageIndex: 0
      }
      if (query) {
        refetchConnectorList(updatedQueryParams, appliedFilter?.filterProperties)
      } /* on clearing query */ else {
        page === 0
          ? /* fetch connectors for 1st page */ refetchConnectorList(
              updatedQueryParams,
              appliedFilter?.filterProperties
            )
          : /* or navigate to first page */ setPage(0)
      }
    }, 500),
    [refetchConnectorList, appliedFilter?.filterProperties]
  )

  /* Clearing filter from Connector Filter Panel */
  const reset = (): void => {
    refetchConnectorList({ ...defaultQueryParams, searchTerm })
    setAppliedFilter(undefined)
    setConnectorFetchError(undefined)
  }

  return (
    <>
      <div className={css.main}>
        <div className={css.header}>
          <Breadcrumbs
            links={[
              {
                label: project?.name || '',
                url: routes.toProjectOverview({ orgIdentifier, projectIdentifier, accountId, module })
              },
              {
                label: 'GitOps',
                url: ''
              }
            ]}
          />
          <div className="ng-tooltip-native">
            <h2 data-tooltip-id={textIdentifier}>{getString('cd.gitOps')}</h2>
            <HarnessDocTooltip tooltipId={textIdentifier} useStandAlone={true} />
          </div>
        </div>

        <Layout.Horizontal flex className={css.addProviderHeader}>
          <Layout.Horizontal spacing="small">
            <RbacButton
              intent="primary"
              text={getString('cd.newProvider')}
              icon="plus"
              permission={{
                permission: PermissionIdentifier.CREATE_PROJECT, // change to ADD_NEW_PROVIDER
                resource: {
                  resourceType: ResourceType.ACCOUNT,
                  resourceIdentifier: projectIdentifier
                }
              }}
              onClick={() => {
                setActiveProvider(null)
                addNewProviderModal()
              }}
              id="newProviderBtn"
              data-test="newProviderButton"
            />
          </Layout.Horizontal>

          <Layout.Horizontal margin={{ left: 'small' }}>
            <Container data-name="connectorSeachContainer">
              <ExpandingSearchInput
                alwaysExpanded
                width={200}
                placeholder={getString('search')}
                throttle={200}
                onChange={(query: string) => {
                  debouncedConnectorSearch(encodeURIComponent(query))
                  setSearchTerm(query)
                }}
                className={css.expandSearch}
              />
            </Container>
          </Layout.Horizontal>
        </Layout.Horizontal>

        <Layout.Vertical>
          <Page.Body>
            {loading ? (
              <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
                <PageSpinner />
              </div>
            ) : /* istanbul ignore next */ connectorFetchError && shouldShowError(connectorFetchError) ? (
              <div style={{ paddingTop: '200px' }}>
                <PageError
                  message={(connectorFetchError?.data as Error)?.message || connectorFetchError?.message}
                  onClick={(e: React.MouseEvent<Element, MouseEvent>) => {
                    e.preventDefault()
                    e.stopPropagation()
                    reset()
                  }}
                />
              </div>
            ) : connectors?.content?.length ? (
              <ProvidersGridView
                onDelete={refetchConnectorList}
                onEdit={async provider => handleEdit(provider)}
                data={connectors}
                providers={connectors?.content}
                loading={loading}
                gotoPage={(pageNumber: number) => setPage(pageNumber)}
              />
            ) : (
              <Page.NoDataCard icon="nav-dashboard" message={getString('noConnectorFound')} />
            )}
          </Page.Body>
        </Layout.Vertical>
      </div>
    </>
  )
}

export default GitOpsModalContainer
