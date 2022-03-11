/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  flattenObject,
  getFilterByIdentifier,
  getFilterSize,
  getFilterSummary,
  isObjectEmpty,
  removeNullAndEmpty,
  renderItemByType
} from '../utils/FilterUtils'

describe('filter utils tests', () => {
  test('removeNullAndEmpty', () => {
    expect(removeNullAndEmpty({ key: 'value' })).toEqual({ key: 'value' })
    expect(removeNullAndEmpty({})).toEqual({})
    expect(removeNullAndEmpty({ key1: null, key2: 'value2', key3: '' })).toEqual({ key2: 'value2' })
  })

  test('is Object empty', () => {
    expect(isObjectEmpty({})).toEqual(true)
    expect(isObjectEmpty({ key: 'value' })).toEqual(false)
  })

  test('flattenObject', () => {
    expect(flattenObject({ key: { key1: 'value1' } })).toEqual({ key1: 'value1' })
    expect(flattenObject({ key: 'value' })).toEqual({ key: 'value' })
    expect(flattenObject({ key: ['dummy1', 'dummy2'] })).toEqual({ key: ['dummy1', 'dummy2'] })
    expect(flattenObject({ key: [{ dummyKey: { nestedKey: 'nestedValue' } }, 'dummy2'] })).toEqual({
      key: [{ dummyKey: { nestedKey: 'nestedValue' } }, 'dummy2']
    })
    expect(flattenObject({})).toEqual({})
  })

  test('getFilterSize', () => {
    expect(getFilterSize({})).toBe(0)
    expect(getFilterSize({ key: 'value' })).toBe(1)
    expect(getFilterSize({ key: { key1: 'value1' } })).toBe(1)
    expect(getFilterSize({ key: { key1: 'value1', key2: 'value2' } })).toBe(2)
    expect(getFilterSize({ key: { key1: { dummyKey: { nestedKey: 'nestedValue' } } } })).toBe(1)
  })

  test('get filter by identifier', () => {
    expect(getFilterByIdentifier([], '')).toEqual(undefined)
    expect(
      getFilterByIdentifier(
        [
          {
            identifier: 'dummy',
            name: 'dummy',
            filterProperties: {}
          },
          {
            identifier: 'dummy1',
            name: 'dummy1',
            filterProperties: {
              filterType: 'Connector'
            }
          }
        ],
        'dummy'
      )
    ).toEqual({
      identifier: 'dummy',
      name: 'dummy',
      filterProperties: {}
    })
  })

  test('render item by type', () => {
    expect(renderItemByType('')).toEqual('')
    expect(renderItemByType('dummy')).toEqual('dummy')
    expect(renderItemByType(1)).toEqual('1')
    expect(renderItemByType({})).toEqual('')
    expect(renderItemByType([])).toEqual('')
    expect(renderItemByType(['dummy'])).toEqual('dummy')
    expect(renderItemByType(['dummy', 'dummy1'])).toEqual('dummy, dummy1')
    expect(renderItemByType({ key: 'value' })).toEqual('key:value')
    expect(renderItemByType({ key: undefined })).toEqual('key')
    expect(renderItemByType(true)).toEqual('true')
    expect(renderItemByType(false)).toEqual('false')
  })

  test('get filter summary', () => {
    expect(getFilterSummary(new Map(), {})).toBeDefined()
    const map = new Map()
    map.set('key', 'value')
    expect(getFilterSummary(map, { key: 'value' })).toMatchSnapshot()
    expect(getFilterSummary(map, { key1: 'value' })).toMatchSnapshot()
  })
})
