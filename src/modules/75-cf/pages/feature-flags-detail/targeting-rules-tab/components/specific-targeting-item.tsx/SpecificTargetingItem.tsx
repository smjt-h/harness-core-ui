/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, Container, FontVariation, Label, SimpleTagInput, Text } from '@harness/uicore'
import React, { ReactElement } from 'react'
import { useStrings } from 'framework/strings'
import type { Segment, Target, TargetMap } from 'services/cf'
import type { FormVariationMap, TargetGroup } from '../../Types.types'
import css from './SpecificTargetingItem.module.scss'

export interface SpecificTargetingItemProps {
  index: number
  isLoading: boolean
  targets: Target[]
  segments: Segment[]
  formVariationMapItem: FormVariationMap
  updateTargetGroups: (index: number, newTargetGroups: TargetGroup[]) => void
  updateTargets: (index: number, newTargets: TargetMap[]) => void
  removeVariation: () => void
}

export interface TagInputItem {
  label: string
  value: string
}

const SpecificTargetingItem = (props: SpecificTargetingItemProps): ReactElement => {
  const {
    targets,
    segments,
    formVariationMapItem,
    index,
    isLoading,
    updateTargetGroups,
    updateTargets,
    removeVariation
  } = props

  const delimiter = ','

  const { getString } = useStrings()

  return (
    <>
      <Container flex={{ justifyContent: 'space-between' }}>
        <Text inline font={{ variation: FontVariation.BODY }} icon="full-circle">
          {formVariationMapItem.variationName}
        </Text>

        <Button
          data-testid={`remove_variation_${formVariationMapItem.variationIdentifier}`}
          icon="trash"
          minimal
          withoutCurrentColor
          onClick={removeVariation}
        />
      </Container>
      <div data-testid={`${formVariationMapItem.variationIdentifier}_target_groups`}>
        <Label className={css.tagInputLabel}>{getString('cf.featureFlags.rules.toTargetGroups')}</Label>
        <SimpleTagInput
          fill
          readonly={isLoading}
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
                identifier: value[0],
                ruleId: '',
                name: value[1]
              }
            })
            updateTargetGroups(index, newTargetGroups)
          }}
        />
      </div>
      <div data-testid={`${formVariationMapItem.variationIdentifier}_targets`}>
        <Label className={css.tagInputLabel}>{getString('cf.featureFlags.rules.toTargets')}</Label>
        <SimpleTagInput
          fill
          readonly={isLoading}
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
      </div>

      <Container border={{ bottom: true }} />
    </>
  )
}

export default SpecificTargetingItem
