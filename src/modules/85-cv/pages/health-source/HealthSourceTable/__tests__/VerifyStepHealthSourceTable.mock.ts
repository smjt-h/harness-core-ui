/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockedMonitoredService = {
  orgIdentifier: 'default',
  projectIdentifier: 'Harshil_project_service_reliability',
  identifier: 'service1_env1',
  name: 'service1_env1',
  type: 'Application',
  description: '',
  serviceRef: 'service1',
  environmentRef: 'env1',
  environmentRefList: [],
  tags: {},
  sources: {
    healthSources: [],
    changeSources: [
      {
        name: 'Harness CD Next Gen',
        identifier: 'harness_cd_next_gen',
        type: 'HarnessCDNextGen',
        enabled: true,
        spec: {},
        category: 'Deployment'
      }
    ]
  },
  dependencies: []
}
