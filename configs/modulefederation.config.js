/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const packageJSON = require('../package.json')
const { pick, omit, mapValues } = require('lodash')

/**
 * These packages must be stricly shared with exact versions
 */
const ExactSharedPackages = [
  'react-dom',
  'react',
  'react-router-dom',
  '@harness/use-modal',
  '@blueprintjs/core',
  '@blueprintjs/select',
  '@blueprintjs/datetime',
  'restful-react'
]

module.exports = ({ enableGitOpsUI, enableSTO }) => {
  const remotes = {}

  if (enableGitOpsUI) {
    // use of single quotes within function call is required to make this work
    remotes.gitopsui = "gitopsui@[window.getApiBaseUrl('gitops/remoteEntry.js')]"
  }

  // TODO (tnhu): Use build an environment variable to enable Governance
  // if (enableGovernance) {
  remotes.governance = "governance@[window.getApiBaseUrl('pm/remoteEntry.js')]"
  // }
  remotes.ccmui = "ccmui@[window.getApiBaseUrl('ccmui/remoteEntry.js')]"

  if (enableSTO) {
    remotes.sto = "sto@[window.getApiBaseUrl('sto/remoteEntry.js')]"
  }

  if (process.env.TARGET_LOCALHOST) {
    remotes.errortracking = 'errortracking@http://localhost:3091/remoteEntry.js'
  } else {
    remotes.errortracking = "errortracking@[window.getApiBaseUrl('et/remoteEntry.js')]"
  }

  return {
    name: 'nextgenui',
    remotes,
    shared: {
      '@harness/uicore': packageJSON.dependencies['@harness/uicore'],
      ...mapValues(pick(packageJSON.dependencies, ExactSharedPackages), version => ({
        singleton: true,
        requiredVersion: version
      }))
    }
  }
}
