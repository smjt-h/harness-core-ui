/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card, Container, FontVariation, Heading, Layout } from '@harness/uicore'
import React, { ReactElement } from 'react'

import { useStrings } from 'framework/strings'
import type { Segment, Target, TargetMap, Variation } from 'services/cf'
import DefaultRules from '../default-rules/DefaultRules'
import SpecificTargetingItem from '../specific-targeting-item.tsx/SpecificTargetingItem'
import type { FormVariationMap, VariationPercentageRollout, TargetGroup } from '../../Types.types'
import PercentageRolloutItem from '../percentage-rollout-item/PercentageRolloutItem'
import AddTargetingButton from '../add-targeting-button/AddTargetingButton'

export interface FlagEnabledRulesCardProps {
  targets: Target[]
  segments: Segment[]
  formVariationMap: FormVariationMap[]
  featureFlagVariations: Variation[]
  variationPercentageRollouts: VariationPercentageRollout[]
  isLoading: boolean
  updateTargetGroups: (index: number, newTargetGroups: TargetGroup[]) => void
  updateTargets: (index: number, newTargetGroups: TargetMap[]) => void
  addVariation: (newVariation: FormVariationMap) => void
  removeVariation: (removedVariation: FormVariationMap) => void
  addPercentageRollout: () => void
  removePercentageRollout: (index: number) => void
}

const FlagEnabledRulesCard = (props: FlagEnabledRulesCardProps): ReactElement => {
  const {
    targets,
    segments,
    formVariationMap,
    featureFlagVariations,
    variationPercentageRollouts,
    updateTargetGroups,
    updateTargets,
    addVariation,
    removeVariation,
    addPercentageRollout,
    removePercentageRollout,
    isLoading
  } = props

  const { getString } = useStrings()

  const addTargetingDropdownVariations = formVariationMap.filter(variation => !variation.isVisible)

  return (
    <Card data-testid="flag-enabled-rules-card">
      <Container border={{ bottom: true }} padding={{ bottom: 'medium' }}>
        <DefaultRules featureFlagVariations={featureFlagVariations} isLoading={isLoading} />
      </Container>
      <Container padding={{ bottom: 'medium' }}>
        <Layout.Vertical spacing="medium">
          <Heading level={4} font={{ variation: FontVariation.BODY2 }} margin={{ top: 'medium' }}>
            {getString('cf.featureFlags.rules.specificTargeting')}
          </Heading>
          {formVariationMap.map((formVariationMapItem, index) => (
            <>
              {formVariationMapItem.isVisible && (
                <SpecificTargetingItem
                  key={`${formVariationMapItem.variationIdentifier}_${index}`}
                  index={index}
                  isLoading={isLoading}
                  targets={targets}
                  segments={segments}
                  formVariationMapItem={formVariationMapItem}
                  updateTargetGroups={updateTargetGroups}
                  updateTargets={updateTargets}
                  removeVariation={() => removeVariation(formVariationMapItem)}
                />
              )}
            </>
          ))}

          {variationPercentageRollouts.map((variationPercentageRollout, index) => (
            <PercentageRolloutItem
              key={variationPercentageRollout.ruleId}
              index={index}
              featureFlagVariations={featureFlagVariations}
              removePercentageRollout={removePercentageRollout}
              segments={segments}
              variationPercentageRollout={variationPercentageRollout}
            />
          ))}

          {(addTargetingDropdownVariations.length > 0 || variationPercentageRollouts.length > 0) && (
            <AddTargetingButton
              addPercentageRollout={addPercentageRollout}
              addTargetingDropdownVariations={addTargetingDropdownVariations}
              addVariation={addVariation}
            />
          )}
        </Layout.Vertical>
      </Container>
    </Card>
  )
}

export default FlagEnabledRulesCard
