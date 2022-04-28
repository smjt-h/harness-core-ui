/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect, useMemo } from 'react'
import get from 'lodash/get'
import { FormError, FormInput, SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { Feature } from 'services/cf'
import { CFVariationColors, PERCENTAGE_ROLLOUT_VALUE } from '@cf/constants'
import type { FlagSettingsVariationCellFields } from '@cf/pages/target-group-detail/TargetGroupDetailPage.types'
import useFormValues from '@cf/hooks/useFormValues'
import PercentageRollout from '@cf/components/PercentageRollout/PercentageRollout'

import css from './VariationsCell.module.scss'

export interface VariationsCellProps {
  row: { original: Feature }
  value: { disabled?: boolean }
}

const VariationsCell: FC<VariationsCellProps> = ({ row: { original: flag }, value: { disabled = false } }) => {
  const { getString } = useStrings()
  const { values, setField, errors } = useFormValues<FlagSettingsVariationCellFields>()
  const fieldPrefix = `flags.${flag.identifier}`

  const flagItems = useMemo<SelectOption[]>(
    () => [
      ...flag.variations.map<SelectOption>(({ identifier, name }, index) => ({
        label: name || identifier,
        value: identifier,
        icon: {
          name: 'full-circle',
          style: { color: CFVariationColors[index] }
        }
      })),
      {
        label: getString('cf.featureFlags.percentageRollout'),
        value: PERCENTAGE_ROLLOUT_VALUE,
        icon: { name: 'percentage' }
      }
    ],
    [flag.variations]
  )

  const rowValues = useMemo<FlagSettingsVariationCellFields>(() => get(values, fieldPrefix), [values, fieldPrefix])

  useEffect(() => {
    if (rowValues?.variation === PERCENTAGE_ROLLOUT_VALUE) {
      flag.variations.forEach(({ identifier }, index) =>
        setField(`${fieldPrefix}.percentageRollout.variations[${index}].variation`, identifier)
      )
    } else {
      setField(`${fieldPrefix}.percentageRollout`, undefined)
    }
  }, [fieldPrefix, flag.variations, rowValues?.variation, setField])

  const percentageRolloutError = useMemo<string>(
    () => get(errors, `${fieldPrefix}.percentageRollout.variations`, '') as string,
    [errors, fieldPrefix]
  )

  return (
    <div className={css.wrapper}>
      <FormInput.Select
        placeholder={getString('cf.segmentDetail.selectVariation')}
        name={`${fieldPrefix}.variation`}
        items={flagItems}
        disabled={disabled}
        className={css.input}
      />

      {rowValues?.variation === PERCENTAGE_ROLLOUT_VALUE && (
        <>
          <PercentageRollout
            variations={flag.variations}
            prefix={field => `${fieldPrefix}.percentageRollout.${field}`}
            fieldValues={rowValues.percentageRollout}
            data-testid="variation-percentage-rollout"
            hideOverError
          />
          {percentageRolloutError && (
            <FormError name={`${fieldPrefix}.percentageRollout`} errorMessage={percentageRolloutError} />
          )}
        </>
      )}
    </div>
  )
}

export default VariationsCell
