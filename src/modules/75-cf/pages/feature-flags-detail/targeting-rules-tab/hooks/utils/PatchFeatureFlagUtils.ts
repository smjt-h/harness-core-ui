/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEqual } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import type { FeatureState, TargetMap } from 'services/cf'
import patch from '@cf/utils/instructions'
import type {
  FormVariationMap,
  TargetGroup,
  TargetingRulesFormValues,
  VariationPercentageRollout
} from '../../Types.types'

// Utils class to help encapsulate the complexity around patch instruction creation and hide this from the components
interface PatchFeatureFlagUtilsReturn {
  hasFlagStateChanged: () => boolean
  hasDefaultOnVariationChanged: () => boolean
  hasDefaultOffVariationChanged: () => boolean
  addedTargetGroups: (formVariation: FormVariationMap) => TargetGroup[]
  removedTargetGroups: (formVariation: FormVariationMap) => TargetGroup[]
  addedTargets: (formVariation: FormVariationMap) => string[]
  removedTargets: (formVariation: FormVariationMap) => string[]
  addedPercentageRollouts: () => VariationPercentageRollout[]
  updatedPercentageRollouts: () => VariationPercentageRollout[]
  removedPercentageRollouts: () => VariationPercentageRollout[]
  createUpdateFlagStateInstruction: () => void
  createDefaultServeOnInstruction: () => void
  createDefaultServeOffInstruction: () => void
  createAddTargetGroupInstructions: (formVariation: FormVariationMap, targetGroups: TargetGroup[]) => void
  createRemoveTargetGroupsInstructions: (targetGroups: TargetGroup[]) => void
  createAddTargetsInstructions: (formVariation: FormVariationMap, targetIds: string[]) => void
  createRemoveTargetsInstructions: (formVariation: FormVariationMap, targetIds: string[]) => void
  createAddPercentageRolloutInstructions: (percentageRollouts: VariationPercentageRollout[]) => void
  createUpdatePercentageRolloutInstructions: (percentageRollouts: VariationPercentageRollout[]) => void
  createRemovePercentageRolloutInstructions: (percentageRollouts: VariationPercentageRollout[]) => void
}

export const PatchFeatureFlagUtils = (
  submittedValues: TargetingRulesFormValues,
  initialValues: TargetingRulesFormValues
): PatchFeatureFlagUtilsReturn => {
  const hasFlagStateChanged = (): boolean => submittedValues.state !== initialValues.state

  const hasDefaultOnVariationChanged = (): boolean => submittedValues.onVariation !== initialValues.onVariation

  const hasDefaultOffVariationChanged = (): boolean => submittedValues.offVariation !== initialValues.offVariation

  const addedTargetGroups = (formVariation: FormVariationMap): TargetGroup[] => {
    const intialTargetGroups: TargetGroup[] = formVariation.targetGroups

    // get the submitted target groups for the given formVariation
    const submittedTargetGroups: TargetGroup[] =
      submittedValues.formVariationMap.find(
        variation => variation.variationIdentifier === formVariation.variationIdentifier
      )?.targetGroups || []

    return submittedTargetGroups.filter(
      submittedTargetGroup =>
        !intialTargetGroups.map(({ identifier }) => identifier).includes(submittedTargetGroup.identifier)
    )
  }

  const removedTargetGroups = (formVariation: FormVariationMap): TargetGroup[] => {
    const submittedTargetGroups: TargetGroup[] =
      submittedValues.formVariationMap.find(
        variation => variation.variationIdentifier === formVariation.variationIdentifier
      )?.targetGroups || []

    return formVariation.targetGroups.filter(
      targetGroup => !submittedTargetGroups.map(({ identifier }) => identifier).includes(targetGroup.identifier)
    )
  }

  const addedTargets = (formVariation: FormVariationMap): string[] => {
    const initialTargetIds = formVariation.targets.map((target: TargetMap) => target.identifier)
    const submittedTargetIds = submittedValues.formVariationMap
      .filter(variation => variation.variationIdentifier === formVariation.variationIdentifier)[0]
      .targets.map(({ identifier }) => identifier)

    return submittedTargetIds.filter(id => !initialTargetIds.includes(id))
  }

  const removedTargets = (formVariation: FormVariationMap): string[] => {
    const initialTargetIds = formVariation.targets.map((target: TargetMap) => target.identifier)
    const submittedTargetIds = submittedValues.formVariationMap
      .filter(variation => variation.variationIdentifier === formVariation.variationIdentifier)[0]
      .targets.map(({ identifier }) => identifier)

    return initialTargetIds.filter(id => !submittedTargetIds.includes(id))
  }

  const addedPercentageRollouts = (): VariationPercentageRollout[] => {
    return submittedValues.variationPercentageRollouts.filter(
      percentageRollout =>
        !initialValues.variationPercentageRollouts.map(({ ruleId }) => ruleId).includes(percentageRollout.ruleId)
    )
  }

  const removedPercentageRollouts = (): VariationPercentageRollout[] => {
    return initialValues.variationPercentageRollouts.filter(
      percentageRollout =>
        !submittedValues.variationPercentageRollouts.map(({ ruleId }) => ruleId).includes(percentageRollout.ruleId)
    )
  }

  const updatedPercentageRollouts = (): VariationPercentageRollout[] => {
    return submittedValues.variationPercentageRollouts.length === initialValues.variationPercentageRollouts.length
      ? submittedValues.variationPercentageRollouts.filter(
          initial => !initialValues.variationPercentageRollouts.some(submitted => isEqual(initial, submitted))
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

  const createAddTargetGroupInstructions = (formVariation: FormVariationMap, targetGroups: TargetGroup[]): void => {
    patch.feature.addAllInstructions(
      targetGroups.map(targetGroup =>
        patch.creators.addRule({
          uuid: uuid(),
          priority: 100,
          serve: {
            variation: formVariation.variationIdentifier
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

  const createAddTargetsInstructions = (formVariation: FormVariationMap, targets: string[]): void => {
    patch.feature.addInstruction(
      patch.creators.addTargetsToVariationTargetMap(formVariation.variationIdentifier, targets)
    )
  }

  const createRemoveTargetsInstructions = (formVariation: FormVariationMap, removedTargetIds: string[]): void => {
    patch.feature.addInstruction(
      patch.creators.removeTargetsToVariationTargetMap(formVariation.variationIdentifier, removedTargetIds)
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
