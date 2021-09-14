export const monitoredService = {
  isEdit: true,
  orgIdentifier: 'default',
  projectIdentifier: 'Demo',
  identifier: 'monitoredservice101',
  name: 'Monitored Service 101',
  type: 'Application' as any,
  description: 'Monitored Service with change source and health source',
  serviceRef: 'ServiceRef102',
  environmentRef: 'EnvironmentRef102',
  tags: { tag1: '', tag2: '' },
  sources: {
    healthSources: [
      {
        name: 'Splunk 102',
        identifier: 'splunk102',
        type: 'Splunk' as any,
        spec: {
          connectorRef: 'Splunk_Conn',
          feature: 'Cloud Logs' as any,
          queries: [
            {
              name: 'SPLUNK Logs Query',
              query: 'error OR failed OR severe OR ( sourcetype=access_* ( 404 OR 500 OR 503 ) )',
              serviceInstanceIdentifier: '_sourcetype'
            }
          ]
        }
      }
    ],
    changeSources: [
      {
        name: 'PagerDuty 101',
        identifier: 'pagerduty',
        type: 'PagerDuty' as any,
        desc: 'Alert from PagerDuty',
        enabled: true,
        category: 'Alert' as any,
        spec: {
          connectorRef: 'PagerDutyConnector',
          pagerDutyServiceId: 'pagerDutyServiceId101'
        }
      }
    ]
  },
  dependencies: [
    {
      monitoredServiceIdentifier: 'service1'
    },
    {
      monitoredServiceIdentifier: 'service2'
    }
  ]
}
