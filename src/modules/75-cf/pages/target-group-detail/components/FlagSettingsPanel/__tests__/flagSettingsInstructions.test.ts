/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, omit, pick } from 'lodash-es'
import { PERCENTAGE_ROLLOUT_VALUE } from '@cf/constants'
import {
  getAddFlagsInstruction,
  getFlagSettingsInstructions,
  getRemovedFlagIdentifiers,
  getRemoveFlagsInstruction,
  getUpdatedFlags,
  getUpdateFlagsInstruction,
  getVariationOrServe
} from '../flagSettingsInstructions'
import { mockFlagSettingsFormDataValues, mockSegmentFlags, mockTargetGroupFlagsMap } from '../../../__tests__/mocks'
import type { FlagSettingsFormRow } from '../../../TargetGroupDetailPage.types'

describe('flagSettingsInstructions', () => {
  describe('getFlagSettingsInstructions', () => {
    test('it should return no instructions when nothing changed', async () => {
      expect(getFlagSettingsInstructions(mockFlagSettingsFormDataValues.flags, mockTargetGroupFlagsMap)).toEqual([])
    })

    test('it should return only a removeRule instruction when a flag is removed', async () => {
      const flags = omit(mockFlagSettingsFormDataValues.flags, 'f1')

      const response = getFlagSettingsInstructions(flags, mockTargetGroupFlagsMap)

      expect(response).not.toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'addRule' })]))
      expect(response).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'removeRule' })]))
    })

    test('it should return only an addRule instruction when a flag is changed', async () => {
      const flags = cloneDeep(mockFlagSettingsFormDataValues.flags)
      flags.f1.variation = 'v2'

      const response = getFlagSettingsInstructions(flags, mockTargetGroupFlagsMap)

      expect(response).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'addRule' })]))
      expect(response).not.toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'removeRule' })]))
    })

    test('it should return both removeRule and addRule instructions when a flag is removed and another changed', async () => {
      const flags = omit(cloneDeep(mockFlagSettingsFormDataValues.flags), 'f1')
      flags.f2.variation = 'v1'

      const response = getFlagSettingsInstructions(flags, mockTargetGroupFlagsMap)

      expect(response).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ kind: 'addRule' }),
          expect.objectContaining({ kind: 'removeRule' })
        ])
      )
    })
  })

  describe('getRemovedFlagIdentifiers', () => {
    test('it should return an array with the identifiers of removed flags', async () => {
      const removedFlags = ['f2', 'f4']
      const flags = omit(mockFlagSettingsFormDataValues.flags, ...removedFlags)

      expect(getRemovedFlagIdentifiers(flags, mockTargetGroupFlagsMap)).toEqual(removedFlags)
    })

    test('it should return an empty array when no flags have been removed', async () => {
      expect(getRemovedFlagIdentifiers(mockFlagSettingsFormDataValues.flags, mockTargetGroupFlagsMap)).toEqual([])
    })
  })

  describe('getUpdatedFlags', () => {
    test('it should return an array with the rows of changed flags', async () => {
      const editedRows = [
        cloneDeep(mockFlagSettingsFormDataValues.flags.f2),
        cloneDeep(mockFlagSettingsFormDataValues.flags.f4)
      ]

      editedRows[0].variation = 'v1'
      editedRows[1].variation = 'v1'

      const flags = cloneDeep(mockFlagSettingsFormDataValues.flags)
      flags.f2 = editedRows[0]
      flags.f4 = editedRows[1]

      expect(getUpdatedFlags(flags, mockTargetGroupFlagsMap)).toEqual(editedRows)
    })

    test('it should return an empty array when no flags have been changed', async () => {
      expect(getUpdatedFlags(mockFlagSettingsFormDataValues.flags, mockTargetGroupFlagsMap)).toEqual([])
    })
  })

  describe('getRemoveFlagsInstruction', () => {
    test('it should return the appropriate instruction to remove a single flag', async () => {
      const flagToRemove = mockTargetGroupFlagsMap.f1

      expect(getRemoveFlagsInstruction([flagToRemove.identifier], mockTargetGroupFlagsMap)).toEqual({
        kind: 'removeRule',
        parameters: {
          features: [{ ruleID: flagToRemove.ruleId }]
        }
      })
    })

    test('it should return the appropriate instruction to remove multiple flags', async () => {
      const flagsToRemove = [mockTargetGroupFlagsMap.f1, mockTargetGroupFlagsMap.f2]

      expect(
        getRemoveFlagsInstruction([flagsToRemove[0].identifier, flagsToRemove[1].identifier], mockTargetGroupFlagsMap)
      ).toEqual({
        kind: 'removeRule',
        parameters: {
          features: [{ ruleID: flagsToRemove[0].ruleId }, { ruleID: flagsToRemove[1].ruleId }]
        }
      })
    })
  })

  describe('getUpdateFlagsInstruction', () => {
    test('it should return the appropriate instruction to update a single flag', async () => {
      const flagToUpdate = cloneDeep(mockFlagSettingsFormDataValues.flags.f1)
      flagToUpdate.variation = 'v2'

      expect(getUpdateFlagsInstruction([flagToUpdate], mockTargetGroupFlagsMap)).toEqual({
        kind: 'addRule',
        parameters: {
          features: [
            {
              identifier: flagToUpdate.identifier,
              variation: flagToUpdate.variation,
              ruleID: mockTargetGroupFlagsMap[flagToUpdate.identifier].ruleId
            }
          ]
        }
      })
    })

    test('it should return the appropriate instruction to update multiple flags', async () => {
      const flagsToUpdate = [
        cloneDeep(mockFlagSettingsFormDataValues.flags.f1),
        cloneDeep(mockFlagSettingsFormDataValues.flags.f2)
      ]
      flagsToUpdate[0].variation = 'v2'
      flagsToUpdate[1].variation = 'v1'

      expect(getUpdateFlagsInstruction(flagsToUpdate, mockTargetGroupFlagsMap)).toEqual({
        kind: 'addRule',
        parameters: {
          features: [
            {
              identifier: flagsToUpdate[0].identifier,
              variation: flagsToUpdate[0].variation,
              ruleID: mockTargetGroupFlagsMap[flagsToUpdate[0].identifier].ruleId
            },
            {
              identifier: flagsToUpdate[1].identifier,
              variation: flagsToUpdate[1].variation,
              ruleID: mockTargetGroupFlagsMap[flagsToUpdate[1].identifier].ruleId
            }
          ]
        }
      })
    })
  })

  describe('getAddFlagsInstruction', () => {
    test('it should return the appropriate instruction to add a single flag', async () => {
      const flagToAdd = pick(mockSegmentFlags[0], 'identifier', 'variation')
      flagToAdd.variation = 'v2'

      expect(getAddFlagsInstruction([flagToAdd])).toEqual({
        kind: 'addRule',
        parameters: {
          features: [
            {
              identifier: flagToAdd.identifier,
              variation: flagToAdd.variation
            }
          ]
        }
      })
    })

    test('it should return the appropriate instruction to add multiple flags', async () => {
      const flagsToAdd = [
        pick(mockSegmentFlags[0], 'identifier', 'variation'),
        pick(mockSegmentFlags[1], 'identifier', 'variation')
      ]
      flagsToAdd[0].variation = 'v2'
      flagsToAdd[1].variation = 'v1'

      expect(getAddFlagsInstruction(flagsToAdd)).toEqual({
        kind: 'addRule',
        parameters: {
          features: [
            {
              identifier: flagsToAdd[0].identifier,
              variation: flagsToAdd[0].variation
            },
            {
              identifier: flagsToAdd[1].identifier,
              variation: flagsToAdd[1].variation
            }
          ]
        }
      })
    })
  })

  describe('getVariationOrServe', () => {
    test('it should return a serve object if the variation is Percentage Rollout', async () => {
      const rowValues: FlagSettingsFormRow = {
        identifier: 'abc',
        variation: PERCENTAGE_ROLLOUT_VALUE,
        percentageRollout: {
          variations: [
            { variation: 'var1', weight: 60 },
            { variation: 'var2', weight: 40 }
          ]
        }
      }

      expect(getVariationOrServe(rowValues)).toEqual({
        serve: {
          distribution: {
            bucketBy: 'identifier',
            variations: [
              { variation: 'var1', weight: 60 },
              { variation: 'var2', weight: 40 }
            ]
          }
        }
      })
    })

    test('it should return variation object if the variation is not Percentage Rollout', async () => {
      const rowValues: FlagSettingsFormRow = {
        identifier: 'abc',
        variation: 'var1'
      }

      expect(getVariationOrServe(rowValues)).toEqual({ variation: 'var1' })
    })
  })
})
