/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Card, Container, FontVariation, Heading, Layout, Text } from '@harness/uicore'
import React, { ReactElement } from 'react'

import { PopoverPosition } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { Segment, Target, TargetMap, Variation } from 'services/cf'
import PercentageRollout from '@cf/components/PercentageRollout/PercentageRollout'
import DefaultRules from '../default-rules/DefaultRules'
import SpecificTargetingItem from '../specific-targeting-item.tsx/SpecificTargetingItem'
import type { FormVariationMap, VariationPercentageRollout, TargetGroup } from '../../Types'

export interface FlagEnabledRulesCardProps {
  targets: Target[]
  segments: Segment[]
  formVariationMap: FormVariationMap[]
  featureFlagVariations: Variation[]
  variationPercentageRollout: VariationPercentageRollout
  isLoading: boolean
  updateTargetGroups: (index: number, newTargetGroups: TargetGroup[]) => void
  updateTargets: (index: number, newTargetGroups: TargetMap[]) => void
  addVariation: (newVariation: FormVariationMap) => void
  removeVariation: (removedVariation: FormVariationMap) => void
  addPercentageRollout: () => void
  removePercentageRollout: () => void
}

const FlagEnabledRulesCard = (props: FlagEnabledRulesCardProps): ReactElement => {
  const {
    targets,
    segments,
    formVariationMap,
    featureFlagVariations,
    variationPercentageRollout,
    updateTargetGroups,
    updateTargets,
    addVariation,
    removeVariation,
    addPercentageRollout,
    removePercentageRollout,
    isLoading
  } = props

  const { getString } = useStrings()

  // const firstMount = useRef(true)
  // useLayoutEffect(() => {
  //   if (firstMount.current) {
  //     firstMount.current = false
  //     return
  //   }

  //   console.log('mounted')
  //   updatePercentageRollout()
  // }, [variationPercentageRollout.bucketBy, variationPercentageRollout.variations, variationPercentageRollout.clauses])

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

          {variationPercentageRollout.isVisible && (
            <>
              <Container flex={{ justifyContent: 'space-between' }}>
                <Heading level={4} font={{ variation: FontVariation.BODY2 }} margin={{ top: 'medium' }}>
                  {getString('cf.featureFlags.percentageRollout')}
                </Heading>
                <Button
                  data-testid={`remove_percentage_rollout`}
                  icon="trash"
                  minimal
                  withoutCurrentColor
                  onClick={removePercentageRollout}
                />
              </Container>

              <PercentageRollout
                targetGroups={segments}
                bucketByAttributes={[variationPercentageRollout.bucketBy as string]}
                variations={featureFlagVariations}
                fieldValues={variationPercentageRollout}
                prefix={(fieldName: string) => `variationPercentageRollout.${fieldName}`}
              />
            </>
          )}

          {(addTargetingDropdownVariations.length > 0 || !variationPercentageRollout.isVisible) && (
            <Button
              icon="plus"
              rightIcon="chevron-down"
              variation={ButtonVariation.SECONDARY}
              text="Add Targeting"
              tooltipProps={{
                fill: true,
                interactionKind: 'click-target',
                minimal: true,
                position: PopoverPosition.BOTTOM_LEFT
              }}
              tooltip={
                <Layout.Vertical padding="small" spacing="small">
                  {addTargetingDropdownVariations.map(variation => (
                    <Text
                      data-testid={`variation_option_${variation.variationIdentifier}`}
                      inline
                      onClick={() => addVariation(variation)}
                      key={variation.variationIdentifier}
                      font={{ variation: FontVariation.BODY }}
                      icon="full-circle"
                    >
                      {variation.variationName}
                    </Text>
                  ))}
                  {!variationPercentageRollout.isVisible && (
                    <Text
                      data-testid={`variation_option_percentage_rollout`}
                      inline
                      onClick={() => addPercentageRollout()}
                      font={{ variation: FontVariation.BODY }}
                      icon="percentage"
                    >
                      {getString('cf.featureFlags.percentageRollout')}
                    </Text>
                  )}
                </Layout.Vertical>
              }
            />
          )}
        </Layout.Vertical>
      </Container>
    </Card>
  )
}

export default FlagEnabledRulesCard
