import React from 'react'
import { Button, ButtonVariation } from '@harness/uicore'
import { defaultTo } from 'lodash-es'

import featuresFactory from 'framework/featureStore/FeaturesFactory'
import type { FeatureProps } from 'framework/featureStore/FeaturesFactory'
import type { Module } from 'framework/types/ModuleName'
import { useFeatures } from '@common/hooks/useFeatures'
import { useLocalStorage } from '@common/hooks/useLocalStorage'
import { useModuleInfo } from '@common/hooks/useModuleInfo'

import css from './layouts.module.scss'

export const BANNER_KEY = 'feature_banner_dismissed'

export default function FeatureBanner(): React.ReactElement | null {
  const { module } = useModuleInfo()
  const [activeModuleFeatures, setActiveModuleFeatures] = React.useState<FeatureProps | null>(null)
  const [isBannerDismissed, setIsBannerDismissed] = useLocalStorage<Partial<Record<Module, boolean>>>(
    BANNER_KEY,
    {},
    window.sessionStorage
  )
  const features = useFeatures({ featuresRequest: { featureNames: defaultTo(activeModuleFeatures?.features, []) } })

  React.useEffect(() => {
    if (module) {
      const moduleFeatures = featuresFactory.getFeaturesByModule(module)
      setActiveModuleFeatures(moduleFeatures || null)
    }
  }, [module])

  const message = activeModuleFeatures?.renderMessage(features)

  if (!message || (module && isBannerDismissed[module])) {
    return null
  }

  return (
    <div className={css.featuresBanner}>
      <span>{message}</span>
      <Button
        variation={ButtonVariation.ICON}
        icon="cross"
        data-testid="feature-banner-dismiss"
        onClick={() => setIsBannerDismissed(prev => (module ? { ...prev, [module]: true } : prev))}
      />
    </div>
  )
}
