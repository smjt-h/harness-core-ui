/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, FontVariation, Label, SimpleTagInput, Text } from '@harness/uicore'
import React, { ReactElement } from 'react'
import { useStrings } from 'framework/strings'
import type { Segment, Target, TargetMap } from 'services/cf'
import type { FormVariationMap, TargetGroup } from '../../Types.types'
import DisabledFeatureTooltip from '../disabled-feature-tooltip/DisabledFeatureTooltip'
import css from './SpecificTargetingItem.module.scss'

export interface SpecificTargetingItemProps {
  index: number
  disabled: boolean
  targets: Target[]
  segments: Segment[]
  formVariationMapItem: FormVariationMap
  updateTargetGroups: (index: number, newTargetGroups: TargetGroup[]) => void
  updateTargets: (index: number, newTargets: TargetMap[]) => void
}

export interface TagInputItem {
  label: string
  value: string
}

const SpecificTargetingItem = (props: SpecificTargetingItemProps): ReactElement => {
  const { targets, segments, formVariationMapItem, index, disabled, updateTargetGroups, updateTargets } = props

  const delimiter = ','

  const { getString } = useStrings()

  return (
    <>
      <Container flex={{ justifyContent: 'space-between' }}>
        <Text inline font={{ variation: FontVariation.BODY }} icon="full-circle">
          {formVariationMapItem.variationName}
        </Text>
      </Container>
      <div data-testid={`${formVariationMapItem.variationIdentifier}_target_groups`}>
        <DisabledFeatureTooltip fullWidth>
          <Label className={css.tagInputLabel}>{getString('cf.featureFlags.rules.toTargetGroups')}</Label>
          <SimpleTagInput
            fill
            readonly={disabled}
            inputProps={{ 'data-testid': `${formVariationMapItem.variationIdentifier}-target-groups-input` }}
            items={segments.map<TagInputItem>(segment => ({
              label: segment.name,
              value: `${segment.identifier}${delimiter}${segment.name}`
            }))}
            selectedItems={
              segments.length === 0
                ? []
                : formVariationMapItem.targetGroups.map<string>(
                    (targetGroup: TargetGroup) => `${targetGroup.identifier}${delimiter}${targetGroup.name}`
                  )
            }
            onChange={selectedItems => {
              const newTargetGroups: TargetGroup[] = selectedItems.map(item => {
                const value = item.toString().split(delimiter)
                return {
                  priority: 1,
                  identifier: value[0],
                  ruleId: '',
                  name: value[1]
                }
              })
              updateTargetGroups(index, newTargetGroups)
            }}
          />
        </DisabledFeatureTooltip>
      </div>
      <div data-testid={`${formVariationMapItem.variationIdentifier}_targets`}>
        <DisabledFeatureTooltip fullWidth>
          <Label className={css.tagInputLabel}>{getString('cf.featureFlags.rules.toTargets')}</Label>
          <SimpleTagInput
            fill
            readonly={disabled}
            inputProps={{ 'data-testid': `${formVariationMapItem.variationIdentifier}-target-input` }}
            items={targets.map<TagInputItem>(target => ({
              label: target.name,
              value: `${target.identifier}${delimiter}${target.name}`
            }))}
            selectedItems={
              targets.length === 0
                ? []
                : formVariationMapItem.targets.map<string>(
                    (target: TargetMap) => `${target.identifier}${delimiter}${target.name}`
                  )
            }
            onChange={selectedItems => {
              const newTargets: TargetMap[] = selectedItems.map(item => {
                const value = item.toString().split(delimiter)

                return {
                  identifier: value[0],
                  name: value[1]
                }
              })
              updateTargets(index, newTargets)
            }}
          />
        </DisabledFeatureTooltip>
      </div>

      <Container border={{ bottom: true }} />
    </>
  )
}

export default SpecificTargetingItem
