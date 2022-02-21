/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GitSyncConfig } from 'services/cd-ng'
import { HARNESS_FOLDER_SUFFIX } from '../Constants'
import {
  getCompleteGitPath,
  getEntityUrl,
  getExternalUrl,
  getHarnessFolderPathWithSuffix,
  getRepoPath
} from '../gitSyncUtils'

const entity = {
  repoUrl: 'https://github.com/wings-software/sunnykesh-gitSync',
  folderPath: 'second/.harness/',
  branch: 'gitSync',
  entityGitPath: 'pipelineOne.yaml'
}

describe('gitSyncUtils test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Test getExternalUrl method', () => {
    test('show return correct url', () => {
      const mockConfig = {
        branch: 'feature',
        repo: 'https://github.com/testing/somerepo',
        gitConnectorType: 'Github'
      } as GitSyncConfig
      const testFolderPath = 'samplefolder/.harness'
      const url = getExternalUrl(mockConfig, testFolderPath)
      expect(url).toBe(`${mockConfig.repo}/tree/${mockConfig.branch}/${testFolderPath}`)
    })

    test('empty url for no repo/url or empty branch', () => {
      const mockConfig = {
        branch: 'feature',
        repo: '',
        gitConnectorType: 'Github'
      } as GitSyncConfig
      const url = getExternalUrl(mockConfig, 'samplefolder/.harness')
      expect(url).toBe('')
    })

    test('Repo ending with a "/" with empty Harness folder name', () => {
      const mockConfig = {
        branch: 'feature',
        repo: 'https://github.com/testing/somerepo/',
        gitConnectorType: 'Github'
      } as GitSyncConfig
      const testFolderPath = HARNESS_FOLDER_SUFFIX
      const url = getExternalUrl(mockConfig, testFolderPath)
      expect(url).toBe(`${mockConfig.repo}/tree/${mockConfig.branch}${testFolderPath}`)
    })

    test('valid entity url test', () => {
      const url = getEntityUrl(entity)
      expect(url).toBe(
        'https://github.com/wings-software/sunnykesh-gitSync/blob/gitSync/second/.harness/pipelineOne.yaml'
      )
    })

    test('Invalid entity url test', () => {
      expect(getEntityUrl({ ...entity, repoUrl: undefined })).toBe('')
      expect(getEntityUrl({ ...entity, folderPath: undefined })).toBe('')
      expect(getEntityUrl({ ...entity, branch: undefined })).toBe('')
      expect(getEntityUrl({ ...entity, entityGitPath: undefined })).toBe('')
    })
  })

  describe('Test getCompleteGitPath method', () => {
    test('Repo ending with a "/" with Harness folder name', () => {
      expect(getCompleteGitPath('https://github.com/testing/somerepo/', 'sample', HARNESS_FOLDER_SUFFIX)).toBe(
        'https://github.com/testing/somerepo/sample/.harness/'
      )
    })
    test('Repo not ending with a "/"', () => {
      expect(getCompleteGitPath('https://github.com/wings-software/dev.git', 'abc/temp', HARNESS_FOLDER_SUFFIX)).toBe(
        'https://github.com/wings-software/dev/abc/temp/.harness/'
      )
    })
    test('Root folder as ".harness/"', () => {
      expect(getCompleteGitPath('https://github.com/testing/somerepo', '', HARNESS_FOLDER_SUFFIX)).toBe(
        'https://github.com/testing/somerepo/.harness/'
      )
    })
    test('Nested folder structure with leading and trailing "/" ', () => {
      expect(getCompleteGitPath('https://github.com/testing/somerepo', '///a///b///c////', HARNESS_FOLDER_SUFFIX)).toBe(
        'https://github.com/testing/somerepo/a/b/c/.harness/'
      )
    })
    test('Repo url with .git extension ', () => {
      expect(getCompleteGitPath('https://github.com/testing/somerepo.git', '/a/b/c/d/', HARNESS_FOLDER_SUFFIX)).toBe(
        'https://github.com/testing/somerepo/a/b/c/d/.harness/'
      )
    })
    test('Repo url ends with "/" and folder name starts with "/" ', () => {
      expect(
        getCompleteGitPath('https://github.com/wings-software/dev.git/', '/abc/temp/', HARNESS_FOLDER_SUFFIX)
      ).toBe('https://github.com/wings-software/dev/abc/temp/.harness/')
    })
  })

  describe('Test getHarnessFolderPathWithSuffix method', () => {
    expect(getHarnessFolderPathWithSuffix('/////a////b////c///dd//eeee', HARNESS_FOLDER_SUFFIX)).toBe(
      '/a/b/c/dd/eeee/.harness/'
    )
    expect(getHarnessFolderPathWithSuffix('a/b/c/d1/e4', HARNESS_FOLDER_SUFFIX)).toBe('/a/b/c/d1/e4/.harness/')
  })

  describe('Test getRepoPath method', () => {
    const mockConfig = {
      branch: 'feature',
      repo: '',
      gitConnectorType: 'Github'
    } as GitSyncConfig
    test('Empty repo url', () => {
      expect(getRepoPath(mockConfig)).toBe('')
    })
    test('with non empty repo url', () => {
      mockConfig.repo = 'https://github.com/wings-software'
      expect(getRepoPath(mockConfig)).toBe('wings-software')
    })
    test('with non empty repo url with .git', () => {
      mockConfig.repo = 'https://github.com/wings-software.git'
      expect(getRepoPath(mockConfig)).toBe('wings-software')
    })
    test('with invalid url', () => {
      mockConfig.repo = 'some-random-path'
      expect(getRepoPath(mockConfig)).toBe('')
    })
  })
})
