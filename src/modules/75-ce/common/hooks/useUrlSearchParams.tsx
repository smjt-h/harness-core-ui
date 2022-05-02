/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useLocation, useHistory } from 'react-router-dom'

const useUrlSearchParams = () => {
  const location = useLocation()
  const history = useHistory()

  const getUrlQueryPrams = (additionalParams: Record<string, any> = {}) => {
    const params = new URLSearchParams(location.search)
    Object.keys(additionalParams).forEach(key => {
      const val = additionalParams[key]
      if (val) {
        params.set(key, val)
      } else {
        params.delete(key)
      }
    })
    return params
  }

  const setParamsToUrl = (paramsToSet: Record<string, any> = {}) => {
    const params = getUrlQueryPrams(paramsToSet)
    history.replace({ pathname: location.pathname, search: params.toString() })
  }

  const getQueryParam = (id: string) => {
    return new URLSearchParams(location.search).get(id)
  }

  return {
    getUrlQueryPrams,
    setParamsToUrl,
    getQueryParam
  }
}

export default useUrlSearchParams
