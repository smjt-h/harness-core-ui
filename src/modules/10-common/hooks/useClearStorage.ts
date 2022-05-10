/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import SessionToken from 'framework/utils/SessionToken'

const isInvalidValue = (str: string): boolean => str === 'undefined' || str === 'null' || str === ''

/**
 *
 * @param tokenKey key identifier for token
 * @param dataKey key identifier for specific data in storage
 * @param storage defaults to window.sessionStorage
 */
export const useClearStorage = (tokenKey: string, dataKey: string, storage: Storage = window.sessionStorage): void => {
  //this function will clear out the key-value data for given dataKey on re-login/new-login session
  const storedToken = storage.getItem(tokenKey)

  if (!isInvalidValue(storedToken as string) && storedToken !== SessionToken.getToken()) {
    storage.removeItem(dataKey)
  }
  storage.setItem(tokenKey, SessionToken.getToken())
}
