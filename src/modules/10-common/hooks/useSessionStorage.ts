/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useState, Dispatch, SetStateAction } from 'react'
import SessionToken from 'framework/utils/SessionToken'

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(arg: unknown): arg is Function {
  return typeof arg === 'function'
}

/**
 * Use if you need to store something on session storage :
 *
 * keyName: key to identify specific data in sessionStorage
 *
 * defaultValue : default value in case of empty session storage or first time input
 *
 * sessionStorage data will clear if - tab closed, origin changed (https, port etc.), opening in new tab from current tab etc.
 */

export const useSessionStorage = <T>(
  keyName: string,
  defaultValue: T,
  storage: Storage = window.sessionStorage
): [T, Dispatch<SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const value = storage.getItem(keyName)

      if (value && value !== 'undefined') {
        return JSON.parse(value)
      } else {
        storage.setItem(keyName, JSON.stringify(defaultValue))
        return defaultValue
      }
    } catch (err) {
      return defaultValue
    }
  })

  const setValue = (newValue: SetStateAction<T>): void => {
    try {
      const valueToSet = isFunction(newValue) ? newValue(storedValue) : newValue

      setStoredValue(valueToSet)
      storage.setItem(keyName, JSON.stringify(valueToSet))
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  //this is so that on new login/ re-login sessionStorage data will clear
  const storedToken = storage.getItem('tokenStored')

  if (storedToken && storedToken !== SessionToken.getToken()) {
    setStoredValue(defaultValue)
    storage.clear()
    storage.setItem('tokenStored', SessionToken.getToken())

    return [defaultValue, setValue]
  }
  storage.setItem('tokenStored', SessionToken.getToken())

  return [storedValue, setValue]
}
