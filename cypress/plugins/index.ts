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
          const screenshotName = test.title.join(' -- ').replace('/', '') // cypress fileName creation
          deleteScrenshots.push(screenshotName)
        }
      })
    }
    deleteScrenshots.forEach(file => {
      ;(results as any)?.screenshots.forEach(screenshot => {
        // Matching screenshot path with substring formed by spec+test name
        if (screenshot.path.includes(file)) {
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
  // force color profile
  // https://www.thisdot.co/blog/how-to-set-up-screenshot-comparison-testing-with-cypress-inside-an-nx
  // on('before:browser:launch', (browser: { name: string; family: string } = { name: '', family: '' }, launchOptions) => {
  //   if (browser.family === 'chromium' && browser.name !== 'electron') {
  //     launchOptions.args.push('--force-color-profile=srgb')
  //   }
  //
  //   // if (browser.name === 'chrome') {
  //   //   launchOptions.args.push('--window-size=1440,900')
  //   // } else if (browser.name === 'electron') {
  //   //   launchOptions.preferences['width'] = 1440
  //   //   launchOptions.preferences['height'] = 900
  //   // }
  //
  //   if (browser.name === 'chrome') {
  //     // launchOptions.push('--window-size=1920,1080');
  //     // launchOptions.args.push('--window-size=1920,1080');
  //     // return launchOptions;
  //
  //
  //     launchOptions.preferences.width = 3000;
  //     launchOptions.preferences.height = 1692;
  //     // launchOptions.args.push('--window-size=1400,1200')
  //
  //     // force screen to be non-retina (1400x1200 size)
  //     // launchOptions.args.push('--force-device-scale-factor=1')
  //     // launchOptions.args.push('--force-device-scale-factor=2')
  //
  //     launchOptions.args.push('--start-fullscreen')
  //   }
  //
  //   console.log('name is ', browser.name, browser.family)
  //   if (browser.name === 'electron') {
  //     // fullPage screenshot size is 768x1024
  //     launchOptions.preferences.width = 3000;
  //     launchOptions.preferences.height = 1692;
  //     launchOptions.preferences.frame = false;
  //     launchOptions.preferences.useContentSize = true;
  //   }
  // })
  return config
}
