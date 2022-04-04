/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Instruction } from '@cf/utils/instructions'
import type { FlagSettingsFormData, FlagSettingsFormRow, TargetGroupFlagsMap } from '../../TargetGroupDetailPage.types'

export function getFlagSettingsInstructions(
  flags: FlagSettingsFormData['flags'],
  targetGroupFlagsMap: TargetGroupFlagsMap
): Instruction[] {
  const instructions = []
  const removedFlagIdentifiers = getRemovedFlagIdentifiers(flags, targetGroupFlagsMap)
  const updatedFlags = getUpdatedFlags(flags, targetGroupFlagsMap)

  if (removedFlagIdentifiers.length) {
    instructions.push(getRemoveFlagsInstruction(removedFlagIdentifiers, targetGroupFlagsMap))
  }

  if (updatedFlags.length) {
    instructions.push(getUpdateFlagsInstruction(updatedFlags, targetGroupFlagsMap))
  }

  return instructions
}

export function getRemovedFlagIdentifiers(
  flags: FlagSettingsFormData['flags'],
  targetGroupFlagsMap: TargetGroupFlagsMap
): string[] {
  const newKeys = Object.keys(flags)
  return Object.keys(targetGroupFlagsMap).filter(oldKey => !newKeys.includes(oldKey))
}

export function getUpdatedFlags(
  flags: FlagSettingsFormData['flags'],
  targetGroupFlagsMap: TargetGroupFlagsMap
): FlagSettingsFormRow[] {
  return Object.values(flags).filter(
    ({ identifier, variation }) => targetGroupFlagsMap[identifier]?.variation !== variation
  )
}

export function getRemoveFlagsInstruction(
  identifiers: string[],
  targetGroupFlagsMap: TargetGroupFlagsMap
): Instruction {
  return {
    kind: 'removeRule',
    parameters: {
      features: identifiers.map(identifier => ({ ruleID: targetGroupFlagsMap[identifier].ruleId }))
    }
  } as any as Instruction
}

export function getUpdateFlagsInstruction(
  flags: FlagSettingsFormRow[],
  targetGroupFlagsMap: TargetGroupFlagsMap
): Instruction {
  return {
    kind: 'addRule',
    parameters: {
      features: flags.map(({ identifier, variation }) => ({
        identifier,
        variation,
        ruleID: targetGroupFlagsMap[identifier].ruleId as string
      }))
    }
  } as any as Instruction
}

export function getAddFlagsInstruction(flags: FlagSettingsFormRow[]): Instruction {
  return {
    kind: 'addRule',
    parameters: {
      features: flags.map(({ identifier, variation }) => ({
        identifier,
        variation
      }))
    }
  } as any as Instruction
}
