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
import SpecificTargetingItem from '../specific-targeting-item/SpecificTargetingItem'
import { FormVariationMap, VariationPercentageRollout, TargetGroup, TargetingRuleItemType } from '../../Types.types'
import PercentageRolloutItem from '../percentage-rollout-item/PercentageRolloutItem'
import AddTargetingButton from '../add-targeting-button/AddTargetingButton'

export interface FlagEnabledRulesCardProps {
  targets: Target[]
  segments: Segment[]
  targetingRuleItems: (VariationPercentageRollout | FormVariationMap)[]
  featureFlagVariations: Variation[]
  disabled: boolean
  updateTargetGroups: (index: number, newTargetGroups: TargetGroup[]) => void
  updateTargets: (index: number, newTargetGroups: TargetMap[]) => void
  addVariation: (newVariation: Variation) => void
  removeVariation: (removedVariationIndex: number) => void
  addPercentageRollout: () => void
  removePercentageRollout: (index: number) => void
}

const FlagEnabledRulesCard = (props: FlagEnabledRulesCardProps): ReactElement => {
  const {
    targets,
    segments,
    targetingRuleItems,
    featureFlagVariations,
    updateTargetGroups,
    updateTargets,
    addVariation,
    removeVariation,
    addPercentageRollout,
    removePercentageRollout,
    disabled
  } = props

  const { getString } = useStrings()

  const targetingDropdownVariations = featureFlagVariations.filter(
    variation =>
      !targetingRuleItems
        .map(targetingRuleItem => (targetingRuleItem as FormVariationMap).variationIdentifier)
        .includes(variation.identifier)
  )

  return (
    <Card data-testid="flag-enabled-rules-card">
      <Container border={{ bottom: true }} padding={{ bottom: 'medium' }}>
        <DefaultRules
          featureFlagVariations={featureFlagVariations}
          inputName="onVariation"
          titleStringId="cf.featureFlags.rules.whenFlagEnabled"
        />
      </Container>
      <Container padding={{ bottom: 'medium' }}>
        <Layout.Vertical spacing="medium">
          {targetingRuleItems.map((targetingRuleItem, index) => {
            if (targetingRuleItem.type === TargetingRuleItemType.VARIATION) {
              const item = targetingRuleItem as FormVariationMap
              return (
                <>
                  <Heading level={4} font={{ variation: FontVariation.BODY2 }} margin={{ top: 'medium' }}>
                    {getString('cf.featureFlags.rules.specificTargeting')}
                  </Heading>
                  <SpecificTargetingItem
                    key={`${item.variationIdentifier}_${index}`}
                    index={index}
                    disabled={disabled}
                    targets={targets}
                    segments={segments}
                    formVariationMapItem={item}
                    updateTargetGroups={updateTargetGroups}
                    updateTargets={updateTargets}
                    removeVariation={() => removeVariation(index)}
                  />
                </>
              )
            } else {
              const item = targetingRuleItem as VariationPercentageRollout
              return (
                <PercentageRolloutItem
                  key={item.ruleId}
                  disabled={disabled}
                  index={index}
                  featureFlagVariations={featureFlagVariations}
                  removePercentageRollout={removePercentageRollout}
                  segments={segments}
                  variationPercentageRollout={item}
                />
              )
            }
          })}

          <AddTargetingButton
            addPercentageRollout={addPercentageRollout}
            targetingDropdownVariations={targetingDropdownVariations}
            addVariation={addVariation}
            disabled={disabled}
          />
        </Layout.Vertical>
      </Container>
    </Card>
  )
}

export default FlagEnabledRulesCard
