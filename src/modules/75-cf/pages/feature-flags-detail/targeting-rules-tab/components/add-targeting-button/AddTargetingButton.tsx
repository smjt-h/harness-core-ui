/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { PopoverPosition } from '@blueprintjs/core'
import { FontVariation } from '@harness/design-system'
import { ButtonVariation, Layout, Button, Text } from '@harness/uicore'
import React, { ReactElement } from 'react'
import { useStrings } from 'framework/strings'
import type { FormVariationMap } from '../../Types.types'

interface AddTargetingButtonProps {
  addTargetingDropdownVariations: FormVariationMap[]
  addVariation: (newVariation: FormVariationMap) => void
  addPercentageRollout: () => void
}

const AddTargetingButton = ({
  addTargetingDropdownVariations,
  addVariation,
  addPercentageRollout
}: AddTargetingButtonProps): ReactElement => {
  const { getString } = useStrings()

  return (
    <Button
      icon="plus"
      rightIcon="chevron-down"
      variation={ButtonVariation.SECONDARY}
      text={getString('cf.featureFlags.rules.addTargeting')}
      tooltipProps={{
        fill: true,
        interactionKind: 'click',
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
          <Text
            data-testid="variation_option_percentage_rollout"
            inline
            onClick={() => addPercentageRollout()}
            font={{ variation: FontVariation.BODY }}
            icon="percentage"
          >
            {getString('cf.featureFlags.percentageRollout')}
          </Text>
        </Layout.Vertical>
      }
    />
  )
}

export default AddTargetingButton
