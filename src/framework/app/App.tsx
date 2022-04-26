/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, Suspense } from 'react'

import { useHistory, useParams } from 'react-router-dom'
import { RestfulProvider } from 'restful-react'
import { FocusStyleManager } from '@blueprintjs/core'
import { TooltipContextProvider, PageSpinner } from '@wings-software/uicore'
import { tooltipDictionary } from '@wings-software/ng-tooltip'
import { setAutoFreeze, enableMapSet } from 'immer'
import SessionToken from 'framework/utils/SessionToken'

import { AppStoreProvider } from 'framework/AppStore/AppStoreContext'
import { LicenseStoreProvider } from 'framework/LicenseStore/LicenseStoreContext'
// eslint-disable-next-line aliased-module-imports
import RouteDestinationsWithoutAuth from 'modules/RouteDestinationsWithoutAuth'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'
import { StringsContextProvider } from 'framework/strings/StringsContextProvider'
import { getLoginPageURL } from 'framework/utils/SessionUtils'
import { NGTooltipEditorPortal } from 'framework/tooltip/TooltipEditor'
import AppStorage from 'framework/utils/AppStorage'
import { useRefreshToken } from 'services/portal'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

import './App.scss'
import routes from '@common/RouteDefinitions'
import { returnUrlParams } from '@common/utils/routeUtils'
import { PermissionsProvider } from 'framework/rbac/PermissionsContext'
import { FeaturesProvider } from 'framework/featureStore/FeaturesContext'
import { ThirdPartyIntegrations } from '3rd-party/ThirdPartyIntegrations'
import { useGlobalEventListener } from '@common/hooks'
import { global401HandlerUtils } from '@common/utils/global401HandlerUtils'

const RouteDestinations = React.lazy(() => import('modules/RouteDestinations'))

FocusStyleManager.onlyShowFocusOnTabs()

// set up Immer
setAutoFreeze(false)
enableMapSet()

interface AppProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  strings: Record<string, any>
}

const Harness = (window.Harness = window.Harness || {})
const PREVIEW_TOOLTIP_DATASET_KEY = 'previewTooltipDataset'

const getRequestOptions = (): Partial<RequestInit> => {
  const token = SessionToken.getToken()
  const headers: RequestInit['headers'] = {}

  if (token && token.length > 0) {
    headers.Authorization = `Bearer ${token}`
  }

  return { headers }
}

export function AppWithAuthentication(props: AppProps): React.ReactElement {
  const username = SessionToken.username()
  // always use accountId from URL, and not from local storage
  // if user lands on /, they'll first get redirected to a path with accountId
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()

  const getQueryParams = React.useCallback(() => {
    return {
      routingId: accountId
    }
  }, [accountId])

  const {
    data: refreshTokenResponse,
    refetch: refreshToken,
    loading: refreshingToken
  } = useRefreshToken({
    lazy: true,
    requestOptions: getRequestOptions()
  })

  useEffect(() => {
    const token = SessionToken.getToken()
    if (!token) {
      history.push({
        pathname: routes.toRedirect(),
        search: returnUrlParams(getLoginPageURL({ returnUrl: window.location.href }))
      })
    }
  }, [history])

  useEffect(() => {
    if (refreshTokenResponse?.resource) {
      AppStorage.set('token', refreshTokenResponse.resource)
      AppStorage.set('lastTokenSetTime', +new Date())
    }
  }, [refreshTokenResponse])

  const checkAndRefreshToken = (): void => {
    const currentTime = +new Date()
    const lastTokenSetTime = SessionToken.getLastTokenSetTime() as number
    const refreshInterval = 60 * 60 * 1000 // one hour in milliseconds
    if (currentTime - lastTokenSetTime > refreshInterval && !refreshingToken) {
      refreshToken()
    }
  }

  const [showTooltipEditor, setShowTooltipEditor] = useState(false)
  const [tooltipDictionaryContext, setTooltipDictionaryContext] = useState(tooltipDictionary)

  Harness.openNgTooltipEditor = () => setShowTooltipEditor(true)
  Harness.openTooltipEditor = () => setShowTooltipEditor(true)

  const globalResponseHandler = (response: Response): void => {
    const token = SessionToken.getToken()
    if (!response.ok && response.status === 401) {
      if (token) {
        const lastTokenSetTime = SessionToken.getLastTokenSetTime() as number
        window.bugsnagClient?.notify?.(
          new Error('Logout with token'),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          function (event: any) {
            event.severity = 'error'
            event.setUser(username)
            event.addMetadata('401 Details', {
              url: response.url,
              status: response.status,
              accountId,
              lastTokenSetTime
            })
          }
        )
      }
      global401HandlerUtils(history)
      return
    }

    checkAndRefreshToken()
  }

  useGlobalEventListener('PROMISE_API_RESPONSE', ({ detail }) => {
    if (detail && detail.response) {
      globalResponseHandler(detail.response)
    }
  })

  const onEditorClose = React.useCallback(() => {
    setShowTooltipEditor(false)
    setTooltipDictionaryContext(tooltipDictionary)
  }, [])

  const onPreviewDatasetFromLocalStorage = React.useCallback(() => {
    if (showTooltipEditor) {
      const fromLocalStorage = localStorage.getItem(PREVIEW_TOOLTIP_DATASET_KEY)
      if (typeof fromLocalStorage === 'string') {
        try {
          const parsed = JSON.parse(fromLocalStorage)
          const isExpired = Date.now() > parsed?.expiry
          if (!isExpired) {
            setTooltipDictionaryContext(parsed.value)
          } else {
            setTooltipDictionaryContext(tooltipDictionary)
            localStorage.removeItem(PREVIEW_TOOLTIP_DATASET_KEY)
          }
        } catch (e) {
          setTooltipDictionaryContext(tooltipDictionary)
          window.alert(`Error while parsing preview dataset - ${e}`)
        }
      }
    }
  }, [showTooltipEditor])

  return (
    <RestfulProvider
      base="/"
      requestOptions={getRequestOptions}
      queryParams={getQueryParams()}
      queryParamStringifyOptions={{ skipNulls: true }}
      onResponse={globalResponseHandler}
    >
      <StringsContextProvider initialStrings={props.strings}>
        <TooltipContextProvider initialTooltipDictionary={tooltipDictionaryContext}>
          <AppStoreProvider>
            <AppErrorBoundary>
              <FeaturesProvider>
                <LicenseStoreProvider>
                  <PermissionsProvider>
                    <Suspense fallback={<PageSpinner />}>
                      <RouteDestinations />
                    </Suspense>
                    <NGTooltipEditorPortal
                      showTooltipEditor={showTooltipEditor}
                      onEditorClose={onEditorClose}
                      setPreviewDatasetFromLocalStorage={onPreviewDatasetFromLocalStorage}
                    />
                  </PermissionsProvider>
                  <ThirdPartyIntegrations />
                </LicenseStoreProvider>
              </FeaturesProvider>
            </AppErrorBoundary>
          </AppStoreProvider>
        </TooltipContextProvider>
      </StringsContextProvider>
    </RestfulProvider>
  )
}

export function AppWithoutAuthentication(props: AppProps): React.ReactElement {
  return (
    <RestfulProvider base="/">
      <StringsContextProvider initialStrings={props.strings}>
        <AppErrorBoundary>
          <RouteDestinationsWithoutAuth />
        </AppErrorBoundary>
      </StringsContextProvider>
    </RestfulProvider>
  )
}
