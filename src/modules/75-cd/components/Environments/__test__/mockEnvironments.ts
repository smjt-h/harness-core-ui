/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const accountId = 'zEaak-FLS425IEO7OLzMUg'
const projectIdentifier = 'TNHUFF_PROJECT'
const envType = {
  preProd: 'PreProduction',
  prod: 'Production'
}

export default {
  status: 'SUCCESS',
  data: {
    totalPages: 2,
    totalItems: 20,
    pageItemCount: 15,
    pageSize: 15,
    content: [
      {
        accountId: accountId,
        orgIdentifier: 'Harness',
        projectIdentifier: projectIdentifier,
        identifier: 'foobar',
        name: 'foobar',
        description: '',
        color: '#0063F7',
        type: envType.preProd,
        deleted: false,
        tags: {},
        version: 0
      },
      {
        accountId: accountId,
        orgIdentifier: 'Harness',
        projectIdentifier: projectIdentifier,
        identifier: 'QB',
        name: 'QB',
        description: 'Harness QB environment',
        color: '#0063F7',
        type: envType.preProd,
        deleted: false,
        tags: {
          qb: 'qb',
          'no-restricted': 'no-restricted',
          dev: 'dev',
          testing: 'testing',
          'not-production': 'not-production',
          fun: 'fun'
        },
        version: 0
      },
      {
        accountId: accountId,
        orgIdentifier: 'Harness',
        projectIdentifier: projectIdentifier,
        identifier: 'asdfasdfsa',
        name: 'asdfasdfsa',
        description: 'sadfdsafsdfsadfsadfsdafsfsadfsdafdsaf',
        color: '#0063F7',
        type: envType.preProd,
        deleted: false,
        tags: { fsadf: 'fsadf', asdf: 'asdf', asdfff: 'asdfff' },
        version: 0
      },
      {
        accountId: accountId,
        orgIdentifier: 'Harness',
        projectIdentifier: projectIdentifier,
        identifier: 'EnvironmentJuan',
        name: 'EnvironmentJuan',
        description: '',
        color: '#0063F7',
        type: envType.preProd,
        deleted: false,
        tags: {},
        version: 0
      },
      {
        accountId: accountId,
        orgIdentifier: 'Harness',
        projectIdentifier: projectIdentifier,
        identifier: 'Another_Production',
        name: 'Another Production',
        description: 'Another production env that can be used',
        color: '#0063F7',
        type: envType.prod,
        deleted: false,
        tags: { one: 'one', three: 'three', two: 'two' },
        version: 0
      },
      {
        accountId: accountId,
        orgIdentifier: 'Harness',
        projectIdentifier: projectIdentifier,
        identifier: 'Production_Env',
        name: 'Production Env',
        description: 'this is a production environment to run an application do be careful when handling it',
        color: '#0063F7',
        type: envType.prod,
        deleted: false,
        tags: { B: 'B', prod: 'prod', tag: 'tag' },
        version: 0
      },
      {
        accountId: accountId,
        orgIdentifier: 'Harness',
        projectIdentifier: projectIdentifier,
        identifier: 'new_environment',
        name: 'new environment',
        description: 'this is an environment',
        color: '#0063F7',
        type: envType.preProd,
        deleted: false,
        tags: { new: 'new' },
        version: 0
      },
      {
        accountId: accountId,
        orgIdentifier: 'Harness',
        projectIdentifier: projectIdentifier,
        identifier: 'tagged_env',
        name: 'tagged env',
        description: '',
        color: '#0063F7',
        type: envType.preProd,
        deleted: false,
        tags: { tagged: 'tagged' },
        version: 0
      },
      {
        accountId: accountId,
        orgIdentifier: 'Harness',
        projectIdentifier: projectIdentifier,
        identifier: 'Another_Environment',
        name: 'Another Environment',
        description: '',
        color: '#0063F7',
        type: envType.preProd,
        deleted: false,
        tags: {},
        version: 0
      },
      {
        accountId: accountId,
        orgIdentifier: 'Harness',
        projectIdentifier: projectIdentifier,
        identifier: 'env42',
        name: 'env42',
        description: 'the 42th',
        color: '#0063F7',
        type: envType.preProd,
        deleted: false,
        tags: {},
        version: 0
      },
      {
        accountId: accountId,
        orgIdentifier: 'Harness',
        projectIdentifier: projectIdentifier,
        identifier: 'default',
        name: 'CF Default',
        description: null,
        color: '#0063F7',
        type: envType.prod,
        deleted: false,
        tags: {},
        version: 0
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '3fcb7e6b-8e77-4523-81e5-fdf015b900cc'
}
