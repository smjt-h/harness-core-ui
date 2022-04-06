/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getReadableDateTime } from '@common/utils/dateUtils'

export const DATE_FORMAT = 'MM/DD/YYYY'

export const hasNoExpiryDate = (value?: number): boolean => {
  return getReadableDateTime(value, DATE_FORMAT) === '12/31/2099'
}

export const getSelectedExpiration = (value?: number): string => {
  if (!value) {
    return '30'
  } else if (hasNoExpiryDate(value)) {
    return '-1'
  }
  return 'custom'
}

export const getSelectedExpirationDate = (value: string): string => {
  switch (value) {
    case '30':
    case '90':
    case '180':
      return getReadableDateTime(new Date().setDate(new Date().getDate() + parseInt(value)), DATE_FORMAT)
    case '-1':
      return '12/31/2099'
    default:
      return ''
  }
}

export const getExpirationDate = (value?: number): string => {
  if (value) {
    return getReadableDateTime(value, DATE_FORMAT)
  } else {
    return getSelectedExpirationDate(getSelectedExpiration(value))
  }
}
