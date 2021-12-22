import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useTelemetryInstance } from './useTelemetryInstance'

type TrackEvent = (eventName: string, properties: Record<string, string>) => void
type IdentifyUser = () => void
interface PageParams {
  pageName?: string
  category?: string
  properties?: Record<string, string>
}
interface TelemetryReturnType {
  trackEvent: TrackEvent
  identifyUser: IdentifyUser
}

export function useTelemetry(pageParams: PageParams = {}): TelemetryReturnType {
  const { currentUserInfo } = useAppStore()
  const { accountId: groupId } = useParams<AccountPathProps>()
  const telemetry = useTelemetryInstance()
  const userId = currentUserInfo.email || ''

  useEffect(() => {
    pageParams.pageName &&
      telemetry.page({
        name: pageParams.pageName,
        category: pageParams.category || '',
        properties: { userId, groupId, ...pageParams.properties } || {}
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageParams.pageName, pageParams.category, pageParams.properties])

  const trackEvent: TrackEvent = (eventName: string, properties: Record<string, string>) => {
    telemetry.track({ event: eventName, properties: { userId, groupId, ...properties } })
  }
  const identifyUser: IdentifyUser = () => {
    if (userId) {
      telemetry.identify(userId)
    }
  }
  return { trackEvent, identifyUser }
}
