/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// ***********************************************************
/* eslint-disable @typescript-eslint/no-var-requires, no-console  */
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
const fs = require('fs')
const _ = require('lodash')
const { addMatchImageSnapshotPlugin } = require('cypress-image-snapshot/plugin')

const cypressTypeScriptPreprocessor = require('./cy-ts-preprocessor')
module.exports = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  // we register our plugin using its register method:
  addMatchImageSnapshotPlugin(on, config)
  // Deleting retried screenshots if test passes eventually
  on('after:spec', (spec, results) => {
    const deleteScrenshots = []
    if (results && ((results as any)?.screenshots || []).length) {
      // Checking for any success attempt and storing screenshot name
      results.tests.forEach(test => {
        if (_.some(test.attempts, { state: 'failed' }) && test.state === 'passed') {
          const screenshotName = test.title.join(' -- ').replace(/\/|\.$/gi, '') // cypress fileName creation
          deleteScrenshots.push(screenshotName)
        }
      })
    }
    deleteScrenshots.forEach(file => {
      ;(results as any)?.screenshots.forEach(screenshot => {
        // Matching screenshot path with substring formed by spec+test name
        if (screenshot?.path && screenshot.path.includes(file) && fs.existsSync(screenshot.path)) {
          console.log('file deleted successfully: ', screenshot.path)
          fs.unlinkSync(screenshot.path)
        }
      })
    })
  })

  if (process.env.CYPRESS_COVERAGE) {
    require('@cypress/code-coverage/task')(on, config)
  }
  on('file:preprocessor', cypressTypeScriptPreprocessor)
  return config
}
