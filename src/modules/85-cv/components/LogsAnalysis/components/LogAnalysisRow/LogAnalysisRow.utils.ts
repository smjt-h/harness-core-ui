/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { LogData } from 'services/cv'

export const getEventTypeFromClusterType = (tag: LogData['tag']): string => {
  switch (tag) {
    case 'KNOWN':
      return 'Known'
    case 'UNKNOWN':
      return 'Unknown'
    case 'UNEXPECTED':
      return 'Unexpected'
    default:
      return ''
  }
}

export const onClickErrorTrackingRow = (message: string): void => {
  const rowMessageSplit = message.split('|')
  const timestamp = rowMessageSplit[rowMessageSplit.length - 1].trim()
  const requestId = rowMessageSplit[rowMessageSplit.length - 2].trim()
  const sid = rowMessageSplit[rowMessageSplit.length - 3].trim()

  // Make duration window 1 hour from timestamp
  const fromTimestamp = parseInt(timestamp) - 3600

  const arcJson = `{
          "service_id": "${sid}",
          "viewport_strings":{
            "from_timestamp":"${fromTimestamp}",
            "to_timestamp":"${timestamp}",
            "until_now":false,
            "machine_hashes":[],
            "agent_hashes":[],
            "deployment_hashes":[],
            "request_ids":[${requestId}]
          }
          ,"timestamp":"${timestamp}"
        }`

  window.open(`${localStorage.ERROR_TRACKING_URL}arc?event=${btoa(arcJson)}`)
}
