/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import { getErrorInfoFromErrorObject, useToaster } from '@harness/uicore'
import { v4 as uuid } from 'uuid'
import patch from '@cf/utils/instructions'
import { FeatureState, PatchFeatureQueryParams, TargetMap, usePatchFeature } from 'services/cf'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { showToaster } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import type { FormVariationMap, TargetGroup, TargetingRulesFormValues } from '../Types'
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
    if (submittedValues.state !== initialValues.state) {
      patch.feature.addInstruction(patch.creators.setFeatureFlagState(submittedValues.state as FeatureState))
    }

    if (submittedValues.onVariation !== initialValues.onVariation) {
      patch.feature.addInstruction(patch.creators.updateDefaultServeByVariation(submittedValues.onVariation as string))
    }

    // for each variation, iterate and compare initial Targets/Target groups against the submitted Targets/Target groups and create instructions
    initialValues.formVariationMap.forEach((formVariation: FormVariationMap) => {
      const intialTargetGroups: TargetGroup[] = formVariation.targetGroups

      const submittedTargetGroups: TargetGroup[] =
        submittedValues.formVariationMap.find(
          variation => variation.variationIdentifier === formVariation.variationIdentifier
        )?.targetGroups || []

      const addedTargetGroups: TargetGroup[] = submittedTargetGroups.filter(
        submittedTargetGroup =>
          !intialTargetGroups
            .map(intialTargetGroup => intialTargetGroup.identifier)
            .includes(submittedTargetGroup.identifier)
      )

      if (addedTargetGroups.length) {
        patch.feature.addAllInstructions(
          addedTargetGroups.map(targetGroup =>
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

      const removedTargetGroups: TargetGroup[] = intialTargetGroups.filter(
        targetGroup =>
          !submittedTargetGroups
            .map(submittedTargetGroup => submittedTargetGroup.identifier)
            .includes(targetGroup.identifier)
      )
      if (removedTargetGroups.length) {
        patch.feature.addAllInstructions(
          removedTargetGroups.map(targetGroup => patch.creators.removeRule(targetGroup.ruleId))
        )
      }

      const intialTargetIds = formVariation.targets.map((target: TargetMap) => target.identifier)
      const submittedTargetIds =
        submittedValues.formVariationMap
          .find(variation => variation.variationIdentifier === formVariation.variationIdentifier)
          ?.targets.map((target: TargetMap) => target.identifier) || []

      const addedTargetIds: string[] = submittedTargetIds.filter(id => !intialTargetIds.includes(id))
      if (addedTargetIds.length) {
        patch.feature.addInstruction(
          patch.creators.addTargetsToVariationTargetMap(formVariation.variationIdentifier, addedTargetIds)
        )
      }

      const removedTargetIds: string[] = intialTargetIds.filter(id => !submittedTargetIds.includes(id))
      if (removedTargetIds.length) {
        patch.feature.addInstruction(
          patch.creators.removeTargetsToVariationTargetMap(formVariation.variationIdentifier, removedTargetIds)
        )
      }
    })

    patch.feature.onPatchAvailable(async data => {
      try {
        await patchFeature(data)
        patch.feature.reset()
        await refetchFlag()
        showToaster(getString('cf.messages.flagUpdated'))
      } catch (error: any) {
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
