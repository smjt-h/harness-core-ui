/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, MultiSelectDropDown, MultiSelectOption, SelectOption } from '@wings-software/uicore'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ADD_NEW_VALUE } from '@cv/constants'
import { useEnvironmentSelectOrCreate } from '../UseEnvironmentSelectOrCreate/EnvironmentSelectOrCreateHook'

export interface EnvironmentMultiSelectOrCreateProps {
  disabled?: boolean
  className?: string
  options: Array<SelectOption>
  item?: MultiSelectOption[]
  onSelect(value: MultiSelectOption[]): void
  onNewCreated(value: EnvironmentResponseDTO): void
  popOverClassName?: string
}

export function EnvironmentMultiSelectOrCreate({
  options,
  disabled,
  item,
  onSelect,
  onNewCreated,
  className,
  popOverClassName
}: EnvironmentMultiSelectOrCreateProps): JSX.Element {
  const { getString } = useStrings()
  const { environmentOptions, openHarnessEnvironmentModal } = useEnvironmentSelectOrCreate({ options, onNewCreated })

  const onSelectChange = (val: MultiSelectOption[]): void => {
    if (val.find(it => it.value === ADD_NEW_VALUE)) {
      openHarnessEnvironmentModal()
    } else {
      onSelect(val)
    }
  }

  return (
    <Container onClick={e => e.stopPropagation()}>
      <MultiSelectDropDown
        placeholder={getString('cv.selectOrCreateEnv')}
        value={item}
        items={environmentOptions}
        className={className}
        disabled={disabled}
        onChange={onSelectChange}
        buttonTestId={'sourceFilter'}
        popoverClassName={popOverClassName}
      />
    </Container>
  )
}
