/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const { execSync } = require('child_process')

const filterFiles = fileName => {
  if (fileName.length === 0) {
    return false
  }
  if (
    fileName.endsWith('.test.ts') ||
    fileName.endsWith('.test.tsx') ||
    fileName.endsWith('.snap') ||
    fileName.endsWith('.scss')
  ) {
    return false
  }

  return true
}

const processOutput = execSync(`git diff master --name-status | grep "^A" | cut -c 3-`).toString()
console.log('diff - \n', processOutput)
const splitted = processOutput.split('\n')
const newFilesAdded = splitted.filter(fileName => filterFiles(fileName))
const jsonReport = require(`../coverage/coverage-summary.json`)

if (newFilesAdded.length === 0) {
  console.log('No new files added')
} else {
  console.log('New files added in this PR - ', newFilesAdded)
  let failedFileCount = 0
  const failedFileList = []
  newFilesAdded.forEach(fileName => {
    const fullFilePath = `../${fileName}`
    console.log(`evaluating ${fullFilePath}`)
    const fileReport = jsonReport[fullFilePath]
    console.log(fileReport)
    if (!fileReport) {
      console.log(`file ${fileName} not considered/covered for/in test cases`)
      failedFileCount++
    } else {
      let fileCoveragePassed = true
      for (const prop in fileReport) {
        if (fileReport[prop].pct < 80) {
          fileCoveragePassed = false
          break
        }
      }
      if (fileCoveragePassed) {
        console.log(`coverage passed for ${fileName} with ${JSON.stringify(fileReport)}`)
      } else {
        failedFileCount++
        failedFileList.push(fileName)
        console.log(`coverage 90% not met for ${fileName}`)
      }
    }
  })
  if (failedFileCount > 0) {
    console.log(`Coverage failed for ${failedFileCount} files -  ${failedFileList}`)
    process.exit(1)
  }
}
