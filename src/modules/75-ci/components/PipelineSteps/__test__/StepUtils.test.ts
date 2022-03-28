/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { shouldRenderRunTimeInputView } from '../CIStep/StepUtils'

describe('Test StepUtils', () => {
  test('Test shouldRenderRunTimeInputView method', () => {
    expect(shouldRenderRunTimeInputView('sample-value')).not.toBeTruthy()
    expect(shouldRenderRunTimeInputView('<+input>')).toBeTruthy()
    expect(shouldRenderRunTimeInputView('<+input>.allowedValues(ecr,docker)')).toBeTruthy()
    expect(shouldRenderRunTimeInputView('<+input>.regex(abc*)')).toBeTruthy()
    expect(shouldRenderRunTimeInputView({ key1: '<+input>' })).toBeTruthy()
    expect(shouldRenderRunTimeInputView({ key1: 'sample-value' })).not.toBeTruthy()
    expect(shouldRenderRunTimeInputView({ key1: 'sample-value', key2: '<+input>' })).toBeTruthy()
    expect(
      shouldRenderRunTimeInputView({ key1: 'sample-value', key2: '<+input>.allowedValues(ecr,docker)' })
    ).toBeTruthy()
    expect(shouldRenderRunTimeInputView(123)).not.toBeTruthy()
    expect(shouldRenderRunTimeInputView(null)).not.toBeTruthy()
    expect(shouldRenderRunTimeInputView(undefined)).not.toBeTruthy()
  })
})
