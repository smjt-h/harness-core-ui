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
          connectorRef: '<+input>',
          imagePath: '<+input>',
          tag: '<+input>',
          region: '<+input>'
        },
        identifier: 'FLSDJF',
        type: 'Ecr'
      }
    }
  ],
  primary: {
    spec: {
      connectorRef: 'AWS_Connector_test',
      imagePath: '<+input>',
      tag: '<+input>',
      region: '<+input>'
    },
    type: 'Ecr'
  }
}

export const template = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          spec: {
            connectorRef: '<+input>',
            imagePath: '<+input>',
            tag: '<+input>',
            region: '<+input>'
          },
          identifier: 'FLSDJF',
          type: 'Ecr'
        }
      }
    ],
    primary: {
      spec: {
        connectorRef: 'AWS_Connector_test',
        imagePath: '<+input>',
        tag: '<+input>',
        region: '<+input>'
      },
      type: 'Ecr'
    }
  }
}

export const regions = [
  {
    name: 'GovCloud (US-West)',
    value: 'us-gov-west-1',
    valueType: null
  },
  {
    name: 'GovCloud (US-East)',
    value: 'us-gov-east-1',
    valueType: null
  },
  {
    name: 'US East (N. Virginia)',
    value: 'us-east-1',
    valueType: null
  },
  {
    name: 'US East (Ohio)',
    value: 'us-east-2',
    valueType: null
  },
  {
    name: 'US West (N. California)',
    value: 'us-west-1',
    valueType: null
  },
  {
    name: 'US West (Oregon)',
    value: 'us-west-2',
    valueType: null
  },
  {
    name: 'EU (Ireland)',
    value: 'eu-west-1',
    valueType: null
  },
  {
    name: 'EU (London)',
    value: 'eu-west-2',
    valueType: null
  },
  {
    name: 'EU (Paris)',
    value: 'eu-west-3',
    valueType: null
  },
  {
    name: 'EU (Frankfurt)',
    value: 'eu-central-1',
    valueType: null
  },
  {
    name: 'eu-north-1',
    value: 'eu-north-1',
    valueType: null
  },
  {
    name: 'eu-south-1',
    value: 'eu-south-1',
    valueType: null
  },
  {
    name: 'ap-east-1',
    value: 'ap-east-1',
    valueType: null
  },
  {
    name: 'Asia Pacific (Mumbai)',
    value: 'ap-south-1',
    valueType: null
  },
  {
    name: 'Asia Pacific (Singapore)',
    value: 'ap-southeast-1',
    valueType: null
  },
  {
    name: 'Asia Pacific (Sydney)',
    value: 'ap-southeast-2',
    valueType: null
  },
  {
    name: 'Asia Pacific (Tokyo)',
    value: 'ap-northeast-1',
    valueType: null
  },
  {
    name: 'Asia Pacific (Seoul)',
    value: 'ap-northeast-2',
    valueType: null
  },
  {
    name: 'ap-northeast-3',
    value: 'ap-northeast-3',
    valueType: null
  },
  {
    name: 'South America (São Paulo)',
    value: 'sa-east-1',
    valueType: null
  },
  {
    name: 'China North (Beijing)',
    value: 'cn-north-1',
    valueType: null
  },
  {
    name: 'China (Ningxia)',
    value: 'cn-northwest-1',
    valueType: null
  },
  {
    name: 'Canada (Central)',
    value: 'ca-central-1',
    valueType: null
  },
  {
    name: 'me-south-1',
    value: 'me-south-1',
    valueType: null
  },
  {
    name: 'af-south-1',
    value: 'af-south-1',
    valueType: null
  },
  {
    name: 'us-iso-east-1',
    value: 'us-iso-east-1',
    valueType: null
  },
  {
    name: 'us-isob-east-1',
    value: 'us-isob-east-1',
    valueType: null
  },
  {
    name: 'us-iso-west-1',
    value: 'us-iso-west-1',
    valueType: null
  }
]
