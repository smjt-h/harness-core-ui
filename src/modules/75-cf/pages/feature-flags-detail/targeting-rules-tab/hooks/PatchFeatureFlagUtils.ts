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
import type { FormVariationMap, TargetGroup, TargetingRulesFormValues } from '../Types.types'

// Utils class to help encapsulate the complexity around patch instruction creation and hide this from the components
interface PatchFeatureFlagUtilsReturn {
  hasFlagStateChanged: () => boolean
  hasDefaultOnVariationChanged: () => boolean
  updateFlagState: () => void
  updateDefaultServe: () => void
  addedTargetGroups: (formVariation: FormVariationMap) => TargetGroup[]
  removedTargetGroups: (formVariation: FormVariationMap) => TargetGroup[]
  addedTargets: (formVariation: FormVariationMap) => string[]
  removedTargets: (formVariation: FormVariationMap) => string[]
  percentageRolloutAdded: () => boolean
  percentageRolloutUpdated: () => boolean
  percentageRolloutRemoved: () => boolean
  createAddTargetGroupInstructions: (formVariation: FormVariationMap, targetGroups: TargetGroup[]) => void
  createRemoveTargetGroupsInstructions: (targetGroups: TargetGroup[]) => void
  createAddTargetsInstructions: (formVariation: FormVariationMap, targetIds: string[]) => void
  createRemoveTargetsInstructions: (formVariation: FormVariationMap, targetIds: string[]) => void
  createAddPercentageRolloutInstructions: () => void
  createUpdatePercentageRolloutInstructions: () => void
  createRemovePercentageRolloutInstructions: () => void
}

export const PatchFeatureFlagUtils = (
  submittedValues: TargetingRulesFormValues,
  initialValues: TargetingRulesFormValues
): PatchFeatureFlagUtilsReturn => {
  const hasFlagStateChanged = (): boolean => submittedValues.state !== initialValues.state

  const hasDefaultOnVariationChanged = (): boolean => submittedValues.onVariation !== initialValues.onVariation

  const createUpdateFlagStateInstruction = (): void =>
    patch.feature.addInstruction(patch.creators.setFeatureFlagState(submittedValues.state as FeatureState))

  const createDefaultServeInstruction = (): void =>
    patch.feature.addInstruction(patch.creators.updateDefaultServeByVariation(submittedValues.onVariation))

  const addedTargetGroups = (formVariation: FormVariationMap): TargetGroup[] => {
    const intialTargetGroups: TargetGroup[] = formVariation.targetGroups

    // get the submitted target groups for the given formVariation
    const submittedTargetGroups: TargetGroup[] = submittedValues.formVariationMap.filter(
      variation => variation.variationIdentifier === formVariation.variationIdentifier
    )[0].targetGroups

    return submittedTargetGroups.filter(
      submittedTargetGroup =>
        !intialTargetGroups
          .map(intialTargetGroup => intialTargetGroup.identifier)
          .includes(submittedTargetGroup.identifier)
    )
  }

  const removedTargetGroups = (formVariation: FormVariationMap): TargetGroup[] => {
    const submittedTargetGroups: TargetGroup[] = submittedValues.formVariationMap.filter(
      variation => variation.variationIdentifier === formVariation.variationIdentifier
    )[0].targetGroups

    return formVariation.targetGroups.filter(
      targetGroup =>
        !submittedTargetGroups
          .map(submittedTargetGroup => submittedTargetGroup.identifier)
          .includes(targetGroup.identifier)
    )
  }

  const addedTargets = (formVariation: FormVariationMap): string[] => {
    const intialTargetIds = formVariation.targets.map((target: TargetMap) => target.identifier)
    const submittedTargetIds = submittedValues.formVariationMap
      .filter(variation => variation.variationIdentifier === formVariation.variationIdentifier)[0]
      .targets.map((target: TargetMap) => target.identifier)

    return submittedTargetIds.filter(id => !intialTargetIds.includes(id))
  }

  const removedTargets = (formVariation: FormVariationMap): string[] => {
    const intialTargetIds = formVariation.targets.map((target: TargetMap) => target.identifier)
    const submittedTargetIds = submittedValues.formVariationMap
      .filter(variation => variation.variationIdentifier === formVariation.variationIdentifier)[0]
      .targets.map((target: TargetMap) => target.identifier)

    return intialTargetIds.filter(id => !submittedTargetIds.includes(id))
  }

  const percentageRolloutAdded = (): boolean =>
    !initialValues.variationPercentageRollout.isVisible && submittedValues.variationPercentageRollout.isVisible

  const percentageRolloutUpdated = (): boolean =>
    !isEqual(initialValues.variationPercentageRollout, submittedValues.variationPercentageRollout)

  const percentageRolloutRemoved = (): boolean =>
    initialValues.variationPercentageRollout.isVisible && !submittedValues.variationPercentageRollout.isVisible

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

  const createAddPercentageRolloutInstructions = (): void => {
    patch.feature.addInstruction(
      patch.creators.addRule({
        uuid: uuid(),
        priority: 102,
        serve: {
          distribution: {
            bucketBy: submittedValues.variationPercentageRollout.bucketBy,
            variations: submittedValues.variationPercentageRollout.variations
          }
        },
        clauses: [
          {
            op: 'segmentMatch',
            values: submittedValues.variationPercentageRollout.clauses[0].values
          }
        ]
      })
    )
  }

  const createUpdatePercentageRolloutInstructions = (): void => {
    const { attribute, negate, op, id, values } = submittedValues.variationPercentageRollout.clauses[0]
    patch.feature.addInstruction(
      patch.creators.updateClause(submittedValues.variationPercentageRollout.ruleId, id as string, {
        attribute,
        negate,
        op,
        values
      })
    )
  }

  const createRemovePercentageRolloutInstructions = (): void => {
    patch.feature.addInstruction(patch.creators.removeRule(submittedValues.variationPercentageRollout.ruleId))
  }

  return {
    hasFlagStateChanged,
    hasDefaultOnVariationChanged,
    updateFlagState: createUpdateFlagStateInstruction,
    updateDefaultServe: createDefaultServeInstruction,
    addedTargetGroups,
    removedTargetGroups,
    addedTargets,
    removedTargets,
    percentageRolloutAdded,
    percentageRolloutUpdated,
    percentageRolloutRemoved,
    createAddTargetGroupInstructions,
    createRemoveTargetGroupsInstructions,
    createAddTargetsInstructions,
    createRemoveTargetsInstructions,
    createAddPercentageRolloutInstructions,
    createUpdatePercentageRolloutInstructions,
    createRemovePercentageRolloutInstructions
  }
}
