/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  calculateErrorBudgetByIncrement,
  calculateRemainingErrorBudgetByIncrement
} from '../useErrorBudgetRestHook.utils'

describe('useErrorBudgetRestHook utils', () => {
  test('calculateErrorBudgetByIncrement', () => {
    expect(calculateErrorBudgetByIncrement(100)).toStrictEqual(0)
    expect(calculateErrorBudgetByIncrement(100, undefined)).toStrictEqual(0)
    expect(calculateErrorBudgetByIncrement(100, NaN)).toStrictEqual(0)
    expect(calculateErrorBudgetByIncrement(100, 100)).toStrictEqual(200)
    expect(calculateErrorBudgetByIncrement(-100, 100)).toStrictEqual(-200)
    expect(calculateErrorBudgetByIncrement(100, -100)).toStrictEqual(0)
    expect(calculateErrorBudgetByIncrement(-100, -100)).toStrictEqual(0)
  })

  test('calculateRemainingErrorBudgetByIncrement', () => {
    expect(calculateRemainingErrorBudgetByIncrement(100, 50, 100)).toStrictEqual(150)
  })
})
