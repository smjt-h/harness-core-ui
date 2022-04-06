/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FontVariation } from '@harness/design-system'
import { Container, Heading, Button } from '@harness/uicore'
import React, { ReactElement } from 'react'
import PercentageRollout from '@cf/components/PercentageRollout/PercentageRollout'
import type { Segment, Variation } from 'services/cf'
import { useStrings } from 'framework/strings'
import type { VariationPercentageRollout } from '../../Types.types'
import { DisabledFeatureTooltip } from '../disabled-feature-tooltip/DisabledFeatureTooltip'

interface VariationPercentageRolloutProps {
  variationPercentageRollout: VariationPercentageRollout
  index: number
  disabled: boolean
  removePercentageRollout: (index: number) => void
  segments: Segment[]
  featureFlagVariations: Variation[]
}

const PercentageRolloutItem = ({
  variationPercentageRollout,
  index,
  disabled,
  removePercentageRollout,
  segments,
  featureFlagVariations
}: VariationPercentageRolloutProps): ReactElement => {
  const { getString } = useStrings()

  return (
    <>
      <Container flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading level={4} font={{ variation: FontVariation.BODY2 }}>
          {getString('cf.featureFlags.percentageRollout')}
        </Heading>
        <DisabledFeatureTooltip>
          <Button
            disabled={disabled}
            data-testid={`remove_percentage_rollout_${index}`}
            icon="trash"
            minimal
            withoutCurrentColor
            onClick={() => removePercentageRollout(index)}
          />
        </DisabledFeatureTooltip>
      </Container>

      <Container
        key={`percentage_rollout_item_${variationPercentageRollout.ruleId}`}
        data-testid={`percentage_rollout_item_${index}`}
      >
        <PercentageRollout
          targetGroups={segments}
          bucketByAttributes={[variationPercentageRollout.bucketBy]}
          variations={featureFlagVariations}
          fieldValues={variationPercentageRollout}
          prefix={(fieldName: string) => `variationPercentageRollouts[${index}].${fieldName}`}
        />
      </Container>
      <Container border={{ bottom: true }} />
    </>
  )
}

export default PercentageRolloutItem
