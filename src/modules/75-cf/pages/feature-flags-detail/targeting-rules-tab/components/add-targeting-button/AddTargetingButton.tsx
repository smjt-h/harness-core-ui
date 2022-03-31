/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { PopoverPosition } from '@blueprintjs/core'
import { FontVariation } from '@harness/design-system'
import { ButtonVariation, Layout, Button, Text } from '@harness/uicore'
import React, { ReactElement, useState } from 'react'
import { useStrings } from 'framework/strings'
import type { FormVariationMap } from '../../Types.types'
import { DisabledFeatureTooltipContent } from '../disabled-feature-tooltip/DisabledFeatureTooltip'
import css from './AddTargetingButton.module.scss'

interface AddTargetingButtonProps {
  addTargetingDropdownVariations: FormVariationMap[]
  addVariation: (newVariation: FormVariationMap) => void
  addPercentageRollout: () => void
  featureDisabled?: boolean
  disabled?: boolean
}

const AddTargetingButton = ({
  addTargetingDropdownVariations,
  addVariation,
  addPercentageRollout,
  featureDisabled,
  disabled
}: AddTargetingButtonProps): ReactElement => {
  const { getString } = useStrings()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Button
      disabled={featureDisabled || disabled}
      icon="plus"
      rightIcon="chevron-down"
      variation={ButtonVariation.SECONDARY}
      text={getString('cf.featureFlags.rules.addTargeting')}
      onClick={e => {
        e.preventDefault()
        setIsOpen(true)
      }}
      tooltipProps={{
        fill: featureDisabled ? false : true,
        interactionKind: featureDisabled ? 'hover' : 'click',
        minimal: featureDisabled ? false : true,
        position: PopoverPosition.BOTTOM_LEFT,
        isOpen,
        openOnTargetFocus: true,
        onInteraction: nextOpenState => setIsOpen(nextOpenState)
      }}
      tooltip={
        featureDisabled ? (
          <DisabledFeatureTooltipContent />
        ) : (
          // <Layout.Vertical padding="small" spacing="small">
          <Layout.Vertical>
            {addTargetingDropdownVariations.map(variation => (
              <Button
                className={css.addTargetingMenuItem}
                data-testid={`variation_option_${variation.variationIdentifier}`}
                onClick={() => {
                  setIsOpen(false)
                  addVariation(variation)
                }}
                key={variation.variationIdentifier}
                font={{ variation: FontVariation.BODY }}
                icon="full-circle"
              >
                <Text font={{ variation: FontVariation.BODY }}> {variation.variationName}</Text>
              </Button>
            ))}
            <Button
              data-testid="variation_option_percentage_rollout"
              className={css.addTargetingMenuItem}
              onClick={() => {
                setIsOpen(false)
                addPercentageRollout()
              }}
              font={{ variation: FontVariation.BODY }}
              icon="percentage"
            >
              <Text font={{ variation: FontVariation.BODY }}> {getString('cf.featureFlags.percentageRollout')}</Text>
            </Button>
          </Layout.Vertical>
        )
      }
    />
  )
}

export default AddTargetingButton
