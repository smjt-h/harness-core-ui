/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import { useToaster } from '@harness/uicore'
import patch from '@cf/utils/instructions'
import { PatchFeatureQueryParams, usePatchFeature, Variation } from 'services/cf'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { showToaster } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { TargetingRulesFormValues } from '../Types.types'
import { PatchFeatureFlagUtils } from './utils/PatchFeatureFlagUtils'
export interface UsePatchFeatureFlagProps {
  featureFlagIdentifier: string
  initialValues: TargetingRulesFormValues
  variations: Variation[]
  refetchFlag: () => Promise<unknown>
}

interface UsePatchFeatureFlagReturn {
  saveChanges: (newValues: TargetingRulesFormValues) => void
  loading: boolean
}

const usePatchFeatureFlag = ({
  featureFlagIdentifier,
  initialValues,
  variations,
  refetchFlag
}: UsePatchFeatureFlagProps): UsePatchFeatureFlagReturn => {
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()
  const { getRBACErrorMessage } = useRBACError()
  const { showError } = useToaster()
  const { getString } = useStrings()

  const { mutate: patchFeature, loading } = usePatchFeature({
    identifier: featureFlagIdentifier as string,
    queryParams: {
      projectIdentifier,
      environmentIdentifier,
      accountIdentifier,
      orgIdentifier
    } as PatchFeatureQueryParams
  })

  const saveChanges = (submittedValues: TargetingRulesFormValues): void => {
    const patchFeatureUtils = PatchFeatureFlagUtils(submittedValues, initialValues)

    // flag state
    if (patchFeatureUtils.hasFlagStateChanged()) {
      patchFeatureUtils.createUpdateFlagStateInstruction()
    }

    // default ON serves
    if (patchFeatureUtils.hasDefaultOnVariationChanged()) {
      patchFeatureUtils.createDefaultServeOnInstruction()
    }

    // default OFF serves
    if (patchFeatureUtils.hasDefaultOffVariationChanged()) {
      patchFeatureUtils.createDefaultServeOffInstruction()
    }

    // for each variation, iterate and compare initial Targets/Target groups against the submitted Targets/Target groups and create instructions
    variations.forEach((variation: Variation) => {
      const addedTargetGroups = patchFeatureUtils.addedTargetGroups(variation.identifier)
      if (addedTargetGroups.length) {
        patchFeatureUtils.createAddTargetGroupInstructions(variation.identifier, addedTargetGroups)
      }

      const removedTargetGroups = patchFeatureUtils.removedTargetGroups(variation.identifier)
      if (removedTargetGroups.length) {
        patchFeatureUtils.createRemoveTargetGroupsInstructions(removedTargetGroups)
      }

      const addedTargetIds = patchFeatureUtils.addedTargets(variation.identifier)

      if (addedTargetIds.length) {
        patchFeatureUtils.createAddTargetsInstructions(variation.identifier, addedTargetIds)
      }

      const removedTargetIds = patchFeatureUtils.removedTargets(variation.identifier)
      if (removedTargetIds.length) {
        patchFeatureUtils.createRemoveTargetsInstructions(variation.identifier, removedTargetIds)
      }
    })

    // handle added/removed/updated percentage rollouts
    const addedPercentageRollouts = patchFeatureUtils.addedPercentageRollouts()
    if (addedPercentageRollouts.length) {
      patchFeatureUtils.createAddPercentageRolloutInstructions(addedPercentageRollouts)
    }

    const removedPercentageRollouts = patchFeatureUtils.removedPercentageRollouts()
    if (removedPercentageRollouts.length) {
      patchFeatureUtils.createRemovePercentageRolloutInstructions(removedPercentageRollouts)
    }

    const updatedPercentageRollouts = patchFeatureUtils.updatedPercentageRollouts()
    if (updatedPercentageRollouts.length) {
      patchFeatureUtils.createUpdatePercentageRolloutInstructions(updatedPercentageRollouts)
    }

    // submit request
    patch.feature.onPatchAvailable(async data => {
      try {
        await patchFeature(data)
        patch.feature.reset()
        await refetchFlag()
        showToaster(getString('cf.messages.flagUpdated'))
      } catch (error: any) {
        patch.feature.reset()
        showError(getRBACErrorMessage(error))
      }
    })
  }
  return {
    saveChanges,
    loading
  }
}

export default usePatchFeatureFlag
