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
        spec: {
          connectorRef: 'Docker_Conn',
          imagePath: './',
          tag: '<+input>'
        },
        identifier: 'sidecar2',
        type: 'DockerRegistry'
      }
    },
    {
      sidecar: {
        spec: {
          connectorRef: '<+input>',
          imagePath: '<+input>',
          tag: '<+input>'
        },
        identifier: 'Sidecar test',
        type: 'DockerRegistry'
      }
    },
    {
      sidecar: {
        spec: {
          connectorRef: '<+input>',
          imagePath: '<+input>',
          tag: '<+input>',
          registryHostname: 'gcr.io'
        },
        identifier: 'GCR sidecar',
        type: 'Gcr'
      }
    },
    {
      sidecar: {
        spec: {
          connectorRef: 'AWS_Connector_test',
          imagePath: '<+input>',
          tag: '<+input>',
          region: '<+input>'
        },
        identifier: 'Sidecar ECR',
        type: 'Ecr'
      }
    }
  ]
}

export const template = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'sidecar2',
          type: 'DockerRegistry',
          spec: {
            tag: '<+input>'
          }
        }
      },
      {
        sidecar: {
          identifier: 'Sidecar test',
          type: 'DockerRegistry',
          spec: {
            connectorRef: '<+input>',
            imagePath: '<+input>',
            tag: '<+input>'
          }
        }
      },
      {
        sidecar: {
          identifier: 'GCR sidecar',
          type: 'Gcr',
          spec: {
            connectorRef: '<+input>',
            imagePath: '<+input>',
            tag: '<+input>'
          }
        }
      },
      {
        sidecar: {
          identifier: 'Sidecar ECR',
          type: 'Ecr',
          spec: {
            imagePath: '<+input>',
            tag: '<+input>',
            region: '<+input>'
          }
        }
      }
    ]
  }
}
