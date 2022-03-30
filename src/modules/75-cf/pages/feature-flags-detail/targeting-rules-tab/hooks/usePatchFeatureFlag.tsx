/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import { getErrorInfoFromErrorObject, useToaster } from '@harness/uicore'
import patch from '@cf/utils/instructions'
import { PatchFeatureQueryParams, usePatchFeature } from 'services/cf'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { showToaster } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import type { FormVariationMap, TargetingRulesFormValues } from '../Types.types'
import { PatchFeatureFlagUtils } from './utils/PatchFeatureFlagUtils'
export interface UsePatchFeatureFlagProps {
  featureFlagIdentifier: string
  initialValues: TargetingRulesFormValues
  refetchFlag: () => Promise<unknown>
}

interface UsePatchFeatureFlagReturn {
  saveChanges: (newValues: TargetingRulesFormValues) => void
  loading: boolean
}

const usePatchFeatureFlag = ({
  featureFlagIdentifier,
  initialValues,
  refetchFlag
}: UsePatchFeatureFlagProps): UsePatchFeatureFlagReturn => {
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()
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

    if (patchFeatureUtils.hasFlagStateChanged()) {
      patchFeatureUtils.updateFlagState()
    }

    if (submittedValues.onVariation !== initialValues.onVariation) {
      patchFeatureUtils.updateDefaultServe()
    }

    // for each variation, iterate and compare initial Targets/Target groups against the submitted Targets/Target groups and create instructions
    initialValues.formVariationMap.forEach((formVariation: FormVariationMap) => {
      const addedTargetGroups = patchFeatureUtils.addedTargetGroups(formVariation)
      if (addedTargetGroups.length) {
        patchFeatureUtils.createAddTargetGroupInstructions(formVariation, addedTargetGroups)
      }

      const removedTargetGroups = patchFeatureUtils.removedTargetGroups(formVariation)
      if (removedTargetGroups.length) {
        patchFeatureUtils.createRemoveTargetGroupsInstructions(removedTargetGroups)
      }

      const addedTargetIds = patchFeatureUtils.addedTargets(formVariation)
      if (addedTargetIds.length) {
        patchFeatureUtils.createAddTargetsInstructions(formVariation, addedTargetIds)
      }

      const removedTargetIds = patchFeatureUtils.removedTargets(formVariation)
      if (removedTargetIds.length) {
        patchFeatureUtils.createRemoveTargetsInstructions(formVariation, removedTargetIds)
      }
    })

    const addedPercentageRollouts = patchFeatureUtils.addedPercentageRollouts()
    const removedPercentageRollouts = patchFeatureUtils.removedPercentageRollouts()
    const updatedPercentageRollouts = patchFeatureUtils.updatedPercentageRollouts()

    if (addedPercentageRollouts.length) {
      patchFeatureUtils.createAddPercentageRolloutInstructions(addedPercentageRollouts)
    }
    if (removedPercentageRollouts.length) {
      patchFeatureUtils.createRemovePercentageRolloutInstructions(removedPercentageRollouts)
    }
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
        showError(getErrorInfoFromErrorObject(error))
      }
    })
  }
  return {
    saveChanges,
    loading
  }
}

export default usePatchFeatureFlag
