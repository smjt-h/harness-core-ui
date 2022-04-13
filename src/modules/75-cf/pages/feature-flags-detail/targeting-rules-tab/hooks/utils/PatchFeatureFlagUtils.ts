/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { v4 as uuid } from 'uuid'
import isEqual from 'lodash-es/isEqual'
import type { FeatureState } from 'services/cf'
import patch from '@cf/utils/instructions'
import {
  FormVariationMap,
  TargetGroup,
  TargetingRuleItemType,
  TargetingRulesFormValues,
  VariationPercentageRollout
} from '../../Types.types'

// Utils class to help encapsulate the complexity around patch instruction creation and hide this from the components.
interface PatchFeatureFlagUtilsReturn {
  hasFlagStateChanged: () => boolean
  hasDefaultOnVariationChanged: () => boolean
  hasDefaultOffVariationChanged: () => boolean
  addedTargetGroups: (variationIdentifier: string) => TargetGroup[]
  removedTargetGroups: (variationIdentifier: string) => TargetGroup[]
  addedTargets: (variationIdentifier: string) => string[]
  removedTargets: (variationIdentifier: string) => string[]
  addedPercentageRollouts: () => VariationPercentageRollout[]
  updatedPercentageRollouts: () => VariationPercentageRollout[]
  removedPercentageRollouts: () => VariationPercentageRollout[]
  createUpdateFlagStateInstruction: () => void
  createDefaultServeOnInstruction: () => void
  createDefaultServeOffInstruction: () => void
  createAddTargetGroupInstructions: (variationIdentifier: string, targetGroups: TargetGroup[]) => void
  createRemoveTargetGroupsInstructions: (targetGroups: TargetGroup[]) => void
  createAddTargetsInstructions: (variationIdentifier: string, targetIds: string[]) => void
  createRemoveTargetsInstructions: (variationIdentifier: string, targetIds: string[]) => void
  createAddPercentageRolloutInstructions: (percentageRollouts: VariationPercentageRollout[]) => void
  createUpdatePercentageRolloutInstructions: (percentageRollouts: VariationPercentageRollout[]) => void
  createRemovePercentageRolloutInstructions: (percentageRollouts: VariationPercentageRollout[]) => void
}

export const PatchFeatureFlagUtils = (
  submittedValues: TargetingRulesFormValues,
  initialValues: TargetingRulesFormValues
): PatchFeatureFlagUtilsReturn => {
  const initialPercentageRollouts = initialValues.targetingRuleItems.filter(
    targetingRule => targetingRule.type === TargetingRuleItemType.PERCENTAGE_ROLLOUT
  ) as VariationPercentageRollout[]

  const submittedPercentageRollouts = submittedValues.targetingRuleItems.filter(
    targetingRule => targetingRule.type === TargetingRuleItemType.PERCENTAGE_ROLLOUT
  ) as VariationPercentageRollout[]

  const initialVariations = initialValues.targetingRuleItems.filter(
    targetingRule => targetingRule.type === TargetingRuleItemType.VARIATION
  ) as FormVariationMap[]

  const submittedVariations = submittedValues.targetingRuleItems.filter(
    targetingRule => targetingRule.type === TargetingRuleItemType.VARIATION
  ) as FormVariationMap[]

  const hasFlagStateChanged = (): boolean => submittedValues.state !== initialValues.state

  const hasDefaultOnVariationChanged = (): boolean => submittedValues.onVariation !== initialValues.onVariation

  const hasDefaultOffVariationChanged = (): boolean => submittedValues.offVariation !== initialValues.offVariation

  const addedTargetGroups = (variationIdentifier: string): TargetGroup[] => {
    const initialTargetGroups: TargetGroup[] =
      initialVariations.find(x => x.variationIdentifier === variationIdentifier)?.targetGroups || []
    const submittedTargetGroups: TargetGroup[] =
      submittedVariations.find(x => x.variationIdentifier === variationIdentifier)?.targetGroups || []

    return submittedTargetGroups.filter(
      submittedTargetGroup =>
        !initialTargetGroups.map(({ identifier }) => identifier).includes(submittedTargetGroup.identifier)
    )
  }

  const removedTargetGroups = (variationIdentifier: string): TargetGroup[] => {
    const initialTargetGroups: TargetGroup[] =
      initialVariations.find(x => x.variationIdentifier === variationIdentifier)?.targetGroups || []
    const submittedTargetGroups: TargetGroup[] =
      submittedVariations.find(x => x.variationIdentifier === variationIdentifier)?.targetGroups || []

    return initialTargetGroups.filter(
      targetGroup => !submittedTargetGroups.map(({ identifier }) => identifier).includes(targetGroup.identifier)
    )
  }

  const addedTargets = (variationIdentifier: string): string[] => {
    const initialTargetIds: string[] =
      initialVariations.find(x => x.variationIdentifier === variationIdentifier)?.targets.map(x => x.identifier) || []
    const submittedTargetIds: string[] =
      submittedVariations.find(x => x.variationIdentifier === variationIdentifier)?.targets.map(x => x.identifier) || []

    return submittedTargetIds.filter(id => !initialTargetIds.includes(id))
  }

  const removedTargets = (variationIdentifier: string): string[] => {
    const initialTargetIds: string[] =
      initialVariations.find(x => x.variationIdentifier === variationIdentifier)?.targets.map(x => x.identifier) || []
    const submittedTargetIds: string[] =
      submittedVariations.find(x => x.variationIdentifier === variationIdentifier)?.targets.map(x => x.identifier) || []

    return initialTargetIds.filter(id => !submittedTargetIds.includes(id))
  }

  const addedPercentageRollouts = (): VariationPercentageRollout[] => {
    return submittedPercentageRollouts.filter(
      percentageRollout =>
        !initialPercentageRollouts.map(targetingRuleItem => targetingRuleItem.ruleId).includes(percentageRollout.ruleId)
    )
  }

  const removedPercentageRollouts = (): VariationPercentageRollout[] => {
    return initialPercentageRollouts.filter(
      percentageRollout => !submittedPercentageRollouts.map(({ ruleId }) => ruleId).includes(percentageRollout.ruleId)
    )
  }

  const updatedPercentageRollouts = (): VariationPercentageRollout[] => {
    return submittedPercentageRollouts.length === initialPercentageRollouts.length
      ? submittedPercentageRollouts.filter(
          initial => !initialPercentageRollouts.some(submitted => isEqual(initial, submitted))
        )
      : []
  }

  // INSTRUCTIONS SECTION
  const createUpdateFlagStateInstruction = (): void =>
    patch.feature.addInstruction(patch.creators.setFeatureFlagState(submittedValues.state as FeatureState))

  const createDefaultServeOnInstruction = (): void =>
    patch.feature.addInstruction(patch.creators.updateDefaultServeByVariation(submittedValues.onVariation))

  const createDefaultServeOffInstruction = (): void =>
    patch.feature.addInstruction(patch.creators.updateOffVariation(submittedValues.offVariation))

  const createAddTargetGroupInstructions = (variationIdentifier: string, targetGroups: TargetGroup[]): void => {
    patch.feature.addAllInstructions(
      targetGroups.map(targetGroup =>
        patch.creators.addRule({
          uuid: uuid(),
          priority: 100,
          serve: {
            variation: variationIdentifier
          },
          clauses: [
            {
              op: 'segmentMatch',
              values: [targetGroup.identifier]
            }
          ]
        })
      )
    )
  }

  const createRemoveTargetGroupsInstructions = (targetGroups: TargetGroup[]): void => {
    patch.feature.addAllInstructions(targetGroups.map(targetGroup => patch.creators.removeRule(targetGroup.ruleId)))
  }

  const createAddTargetsInstructions = (variationIdentifier: string, targets: string[]): void => {
    patch.feature.addInstruction(patch.creators.addTargetsToVariationTargetMap(variationIdentifier, targets))
  }

  const createRemoveTargetsInstructions = (variationIdentifier: string, removedTargetIds: string[]): void => {
    patch.feature.addInstruction(
      patch.creators.removeTargetsToVariationTargetMap(variationIdentifier, removedTargetIds)
    )
  }

  const createAddPercentageRolloutInstructions = (percentageRollouts: VariationPercentageRollout[]): void => {
    patch.feature.addAllInstructions(
      percentageRollouts.map(percentageRollout =>
        patch.creators.addRule({
          uuid: uuid(),
          priority: 102,
          serve: {
            distribution: {
              bucketBy: percentageRollout.bucketBy,
              variations: percentageRollout.variations
            }
          },
          clauses: [
            {
              op: 'segmentMatch',
              values: percentageRollout.clauses[0].values
            }
          ]
        })
      )
    )
  }

  const createUpdatePercentageRolloutInstructions = (percentageRollouts: VariationPercentageRollout[]): void => {
    percentageRollouts.forEach(percentageRollout => {
      const { bucketBy, variations } = percentageRollout

      patch.feature.addInstruction(
        patch.creators.updateRuleVariation(percentageRollout.ruleId as string, { bucketBy, variations })
      )
      const { attribute, negate, op, id, values } = percentageRollout.clauses[0]
      patch.feature.addInstruction(
        patch.creators.updateClause(percentageRollout.ruleId, id as string, {
          attribute,
          negate,
          op,
          values
        })
      )
    })
  }

  const createRemovePercentageRolloutInstructions = (percentageRollouts: VariationPercentageRollout[]): void => {
    patch.feature.addAllInstructions(
      percentageRollouts.map(percentageRollout => patch.creators.removeRule(percentageRollout.ruleId))
    )
  }

  return {
    hasFlagStateChanged,
    hasDefaultOnVariationChanged,
    hasDefaultOffVariationChanged,
    createUpdateFlagStateInstruction,
    addedTargetGroups,
    removedTargetGroups,
    addedTargets,
    removedTargets,
    addedPercentageRollouts,
    updatedPercentageRollouts,
    removedPercentageRollouts,
    createDefaultServeOnInstruction,
    createDefaultServeOffInstruction,
    createAddTargetGroupInstructions,
    createRemoveTargetGroupsInstructions,
    createAddTargetsInstructions,
    createRemoveTargetsInstructions,
    createAddPercentageRolloutInstructions,
    createUpdatePercentageRolloutInstructions,
    createRemovePercentageRolloutInstructions
  }
}
