/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Icon, PopoverPosition } from '@blueprintjs/core'
import { ButtonVariation } from '@harness/uicore'
import React, { ReactElement } from 'react'
import { useStrings } from 'framework/strings'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { ResourceType } from '@rbac/interfaces/ResourceType'

import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { CFVariationColors } from '@cf/constants'

import type { FormVariationMap } from '../../Types.types'
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
  addPercentageRollout
}: AddTargetingButtonProps): ReactElement => {
  const { getString } = useStrings()

  const items = [
    ...addTargetingDropdownVariations.map((variation, index) => ({
      'data-testid': `variation_option_${variation.variationIdentifier}`,
      onClick: () => addVariation(variation),
      icon: <Icon icon="full-circle" color={CFVariationColors[index]} />,
      text: variation.variationName,
      permission: {
        resource: { resourceType: ResourceType.FEATUREFLAG },
        permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
      },
      featuresProps: {
        featuresRequest: {
          featureNames: [FeatureIdentifier.MAUS]
        }
      }
    })),
    {
      'data-testid': 'variation_option_percentage_rollout',
      onClick: () => addPercentageRollout(),
      icon: <Icon icon="percentage" />,
      text: getString('cf.featureFlags.percentageRollout'),
      permission: {
        resource: { resourceType: ResourceType.FEATUREFLAG },
        permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
      },
      featuresProps: {
        featuresRequest: {
          featureNames: [FeatureIdentifier.MAUS]
        }
      }
    }
  ]

  return (
    <RbacOptionsMenuButton
      icon="plus"
      rightIcon="chevron-down"
      variation={ButtonVariation.SECONDARY}
      text={getString('cf.featureFlags.rules.addTargeting')}
      items={items}
      tooltipProps={{
        interactionKind: 'click',
        minimal: true,
        position: PopoverPosition.BOTTOM_LEFT
      }}
    />
  )
}

export default AddTargetingButton
