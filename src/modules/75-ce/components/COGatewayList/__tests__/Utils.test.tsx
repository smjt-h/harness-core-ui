/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Resource, Service } from 'services/lw'
import { getFulfilmentIcon, getInstancesLink } from '../Utils'
import odIcon from '../images/ondemandIcon.svg'
import spotIcon from '../images/spotIcon.svg'

const mockedService = {
  id: 6115,
  name: 'test',
  fulfilment: 'ondemand',
  kind: 'instance',
  cloud_account_id: 'Lightwing_Non_Prod',
  idle_time_mins: 15,
  host_name: 'mighty-crawdad-c8e9dq1jlfm8dqjkon8g.sandeep.lightwing.io',
  custom_domains: null,
  match_all_subdomains: false,
  disabled: false,
  created_by: '-R-sOjJhQ7OTaLogtkGWSg',
  routing: {
    instance: {
      filter_text: 'name = ""\nvpc_id = ""\n\n[tags]\n  harnesslightwingrule = "c8e9dq8p8ai13r2j7a3g"',
      scale_group: null
    },
    lb: null,
    k8s: null,
    database: null,
    ports: [
      {
        id: 'arn:aws:elasticloadbalancing:us-east-1:357919113896:listener-rule/app/sandeep-test-lb/e2e95a1016c87ed7/c4638a556aa1655d/aa8d4e8c79f8da6a',
        protocol: 'http',
        target_protocol: 'http',
        port: 80,
        target_port: 80,
        server_name: '',
        action: 'forward',
        redirect_url: '',
        routing_rules: []
      }
    ],
    container_svc: null,
    custom_domain_providers: null
  },
  health_check: {
    protocol: 'http',
    path: '/',
    port: 80,
    timeout: 30,
    id: '',
    status_code_from: 200,
    status_code_to: 299
  },
  opts: {
    preserve_private_ip: false,
    delete_cloud_resources: false,
    always_use_private_ip: false,
    access_details: {
      backgroundTasks: {
        selected: false
      },
      dnsLink: {
        selected: true
      },
      ipaddress: {
        selected: false
      },
      rdp: {
        selected: false
      },
      ssh: {
        selected: false
      }
    },
    hide_progress_page: false
  },
  metadata: {
    target_group_details: {
      '80': 'arn:aws:elasticloadbalancing:us-east-1:357919113896:targetgroup/c8e9dqop8ai13r2j7a40/1168c1f0bf89e4cb'
    },
    access_details: null,
    cloud_provider_details: {
      name: 'Lightwing Non Prod'
    },
    service_errors: null,
    kubernetes_connector_id: '',
    health_check_details: null,
    custom_domain_providers: null,
    port_config: [
      {
        id: 'arn:aws:elasticloadbalancing:us-east-1:357919113896:listener-rule/app/sandeep-test-lb/e2e95a1016c87ed7/c4638a556aa1655d/aa8d4e8c79f8da6a',
        protocol: 'http',
        target_protocol: 'http',
        port: 80,
        target_port: 80,
        server_name: '',
        action: 'forward',
        redirect_url: '',
        routing_rules: []
      }
    ]
  },
  access_point_id: 'ap-c8aupomj83uermckpaa0',
  status: 'created',
  created_at: '2022-02-28T09:33:28.938197Z',
  updated_at: '2022-02-28T09:33:32.887936Z',
  account_identifier: 'wFHXHD0RRQWoO8tIZT5YVw'
}

const mockedResource = {
  id: 'i-0241504568408224e',
  name: 'Lightwing Testing Infra',
  region: 'us-east-1',
  availability_zone: 'us-east-1a',
  status: 'stopped',
  type: 'i3.large',
  launch_time: '2022-02-22T05:36:36Z',
  ipv4: 'null',
  private_ipv4: ['172.31.89.154'],
  tags: {
    Name: 'Lightwing Testing Infra',
    doNotDelete: 'True',
    harnessLightwingRule: 'c8atthnrvdqgejgfu5i0',
    harnesslightwingrule: 'c8e9dq8p8ai13r2j7a3g',
    user: 'lightwing'
  },
  resource_type: 'instance',
  provider_name: 'AWS',
  is_spot: false,
  is_managed: false,
  platform: 'Linux',
  cloud_account_id: 0,
  metadata: {
    AmiID: 'ami-0e472ba40eb589f49',
    BlockDeviceMapping: [
      {
        Device: '/dev/sda1',
        VolumeId: 'vol-06c171086078a2b39',
        DeleteOnTermination: true
      }
    ],
    KeyName: 'lightwing-testing-infra',
    NetworkInterfaces: [
      {
        NICID: 'eni-0e09ae21b21d91dd5',
        PrivateIpAddress: '172.31.89.154',
        PrivateIpAddresses: [
          {
            Association: null,
            Primary: true,
            PrivateDnsName: 'i-0241504568408224e.ec2.internal',
            PrivateIpAddress: '172.31.89.154'
          }
        ],
        DeviceIndex: 0,
        SubnetId: 'subnet-373a4419',
        DeleteOnTermination: true
      }
    ],
    SecurityGroups: [
      {
        GroupId: 'sg-0e97cf8436b08730d',
        GroupName: 'lightwing-test-infra'
      }
    ],
    SpotRequestID: null,
    SubnetID: 'subnet-373a4419',
    VpcID: 'vpc-2657db5c'
  },
  provider_type: 'aws',
  cloud_connector_id: 'Lightwing_Non_Prod',
  account_identifier: 'wFHXHD0RRQWoO8tIZT5YVw',
  user_data: null
}

describe('utility methods', () => {
  test('AWS instance link', () => {
    const awsLink =
      'https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Instances:search=i-0241504568408224e;sort=instanceId'
    const link = getInstancesLink(mockedService as unknown as Service, {
      response: [mockedResource as unknown as Resource]
    })
    expect(link).toEqual(awsLink)
  })

  test('Azure instance link', () => {
    const azureLink =
      'https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Compute%2FVirtualMachines'
    const azureResource = { ...mockedResource, provider_type: 'azure' }
    const link = getInstancesLink(mockedService as unknown as Service, {
      response: [azureResource as unknown as Resource]
    })
    expect(link).toEqual(azureLink)
  })

  test('Database link', () => {
    const dbLink =
      'https://console.aws.amazon.com/rds/home?region=us-east-1#database:id=i-0241504568408224e;is-cluster=false'
    const link = getInstancesLink({ ...mockedService, kind: 'database' } as unknown as Service, {
      response: [mockedResource as unknown as Resource]
    })
    expect(link).toEqual(dbLink)
  })

  test('GCP link', () => {
    const gcpLink = 'https://console.cloud.google.com/compute/instancesDetail/zones/us-east-1a/instances/instance-name'
    const resource = { ...mockedResource, provider_type: 'gcp', name: 'instance-name' }
    const link = getInstancesLink({ ...mockedService } as unknown as Service, {
      response: [resource as unknown as Resource]
    })
    expect(link).toEqual(gcpLink)
  })

  test('multiple GCP instances link', () => {
    const gcpLink = 'https://console.cloud.google.com/compute/instances'
    const resource = { ...mockedResource, provider_type: 'gcp' }
    const link = getInstancesLink({ ...mockedService } as unknown as Service, {
      response: [resource as unknown as Resource, resource as unknown as Resource]
    })
    expect(link).toEqual(gcpLink)
  })

  test('fulfilment icon', () => {
    const spotImg = getFulfilmentIcon('spot')
    expect(spotImg).toEqual(spotIcon)
    const odImg = getFulfilmentIcon('on-demand')
    expect(odImg).toEqual(odIcon)
  })
})
