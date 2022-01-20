import type { FeatureIdentifier } from './FeatureIdentifier'
import type { CheckFeaturesReturn } from './featureStoreUtil'

import type { Module } from '../types/ModuleName'

export interface FeatureProps {
  features: FeatureIdentifier[]
  renderMessage(props: CheckFeaturesReturn): React.ReactNode | null
}

export type FeatureRegistry = Partial<Record<Module, FeatureProps>>

class FeatureFactory {
  private featureRegistry: FeatureRegistry = {}

  registerFeaturesByModule(module: Module, props: FeatureProps): void {
    this.featureRegistry[module] = props
  }

  getFeaturesByModule(module: Module): FeatureProps | undefined {
    return this.featureRegistry[module]
  }

  getAllFeatures(): FeatureRegistry {
    return this.featureRegistry
  }

  unregisterFeaturesByModule(module: Module): void {
    delete this.featureRegistry[module]
  }

  unregisterAllFeatures(): void {
    this.featureRegistry = {}
  }
}

const featureFactory = new FeatureFactory()

export default featureFactory
