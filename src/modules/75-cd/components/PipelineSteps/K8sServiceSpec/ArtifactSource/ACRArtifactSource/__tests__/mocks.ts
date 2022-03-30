/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const artifacts = {
  sidecars: [
    {
      sidecar: {
        identifier: 'Sidecar',
        type: 'Acr',
        spec: {
          connectorRef: '<+input>',
          subscription: '<+input>',
          registry: '<+input>',
          repository: '<+input>',
          tag: '<+input>'
        }
      }
    }
  ],
  primary: {
    spec: {
      connectorRef: '<+input>',
      subscription: '<+input>',
      registry: '<+input>',
      repository: '<+input>',
      tag: '<+input>'
    },
    type: 'Acr'
  }
}

export const template = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'Sidecar',
          type: 'Acr',
          spec: {
            connectorRef: '<+input>',
            subscription: '<+input>',
            registry: '<+input>',
            repository: '<+input>',
            tag: '<+input>'
          }
        }
      }
    ],
    primary: {
      spec: {
        connectorRef: '<+input>',
        subscription: '<+input>',
        registry: '<+input>',
        repository: '<+input>',
        tag: '<+input>'
      },
      type: 'Acr'
    }
  }
}

export const artifactsTagRegex = {
  sidecars: [
    {
      sidecar: {
        identifier: 'Sidecar',
        type: 'Acr',
        spec: {
          connectorRef: '<+input>',
          subscription: '<+input>',
          registry: '<+input>',
          repository: '<+input>',
          tagRegex: '<+input>'
        }
      }
    }
  ]
}

export const templateTagRegex = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'Sidecar',
          type: 'Acr',
          spec: {
            connectorRef: '<+input>',
            subscription: '<+input>',
            registry: '<+input>',
            repository: '<+input>',
            tagRegex: '<+input>'
          }
        }
      }
    ]
  }
}

export const artifactsWithValues = {
  sidecars: [
    {
      sidecar: {
        identifier: 'Sidecar',
        type: 'Acr',
        spec: {
          connectorRef: 'connectorRef',
          subscription: 'subscription',
          registry: 'registry',
          repository: 'repository',
          tag: '<+input>'
        }
      }
    }
  ],
  primary: {
    spec: {
      connectorRef: 'connectorRef',
      subscription: 'subscription',
      registry: 'registry',
      repository: 'repository',
      tag: '<+input>'
    },
    type: 'Acr'
  }
}

export const templateWithValues = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'Sidecar',
          type: 'Acr',
          spec: {
            connectorRef: 'connectorRef',
            subscription: 'subscription',
            registry: 'registry',
            repository: 'repository',
            tag: '<+input>'
          }
        }
      }
    ],
    primary: {
      spec: {
        connectorRef: 'connectorRef',
        subscription: 'subscription',
        registry: 'registry',
        repository: 'repository',
        tag: '<+input>'
      },
      type: 'Acr'
    }
  }
}

export const mockSubscriptions = {
  data: { sub1: 'Subscription 1', sub2: 'Subscription 2', sub3: 'Subscription 3' }
}

export const mockRegistries = {
  data: ['reg1', 'reg2', 'reg3']
}

export const mockRepositories = {
  data: ['rep1', 'rep2', 'rep3']
}

export const path = 'stages[0].stage.spec.serviceConfig.serviceDefinition.spec'
