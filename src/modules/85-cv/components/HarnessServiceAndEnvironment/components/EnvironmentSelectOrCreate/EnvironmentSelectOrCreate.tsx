/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Select, SelectOption } from '@wings-software/uicore'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ADD_NEW_VALUE } from '@cv/constants'
import { useEnvironmentSelectOrCreate } from '../UseEnvironmentSelectOrCreate/EnvironmentSelectOrCreateHook'

export interface EnvironmentSelectOrCreateProps {
  item?: SelectOption
  options: Array<SelectOption>
  onSelect(value: SelectOption): void
  disabled?: boolean
  className?: string
  onNewCreated(value: EnvironmentResponseDTO): void
}

export const EnvironmentTypes = [
  {
    label: 'Production',
    value: 'Production'
  },
  {
    label: 'PreProduction',
    value: 'PreProduction'
  }
]

export function generateOptions(response?: EnvironmentResponseDTO[]): SelectOption[] {
  return response
    ? (response
        .filter(entity => entity && entity.identifier && entity.name)
        .map(entity => ({ value: entity.identifier, label: entity.name })) as SelectOption[])
    : []
}

export function EnvironmentSelectOrCreate({
  item,
  options,
  onSelect,
  disabled,
  onNewCreated,
  className
}: EnvironmentSelectOrCreateProps): JSX.Element {
  const { getString } = useStrings()

  const { environmentOptions, openHarnessEnvironmentModal } = useEnvironmentSelectOrCreate({ options, onNewCreated })
  const onSelectChange = (val: SelectOption): void => {
    if (val.value === ADD_NEW_VALUE) {
      openHarnessEnvironmentModal()
    } else {
      onSelect(val)
    }
  }

  return (
    <Container onClick={e => e.stopPropagation()}>
      <Select
        name={'environment'}
        value={item}
        className={className}
        disabled={disabled}
        items={environmentOptions}
        inputProps={{ placeholder: getString('cv.selectOrCreateEnv') }}
        onChange={onSelectChange}
      />
    </Container>
  )
}
