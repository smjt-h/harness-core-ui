/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  monitoredServiceListCall,
  monitoredServiceListResponse
} from '../../../support/85-cv/monitoredService/constants'
import {
  activeMetrics,
  dashboardDetails,
  dashboards,
  dataDogMonitoredService,
  metricTags,
  metrics,
  selectedDashboardName,
  connectorIdentifier
} from '../../../support/85-cv/monitoredService/health-sources/Datadog/constants'
import { errorResponse } from '../../../support/85-cv/slos/constants'
import { Connectors } from '../../../utils/connctors-utils'

describe('Configure Datadog health source', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      return false
    })
    cy.login('test', 'test')
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListResponse)
    cy.intercept(
      'GET',
      '/cv/api/monitored-service/count-of-services?routingId=accountId&accountId=accountId&orgIdentifier=default&projectIdentifier=project1',
      { allServicesCount: 1, servicesAtRiskCount: 0 }
    )
    cy.visitChangeIntelligence()
  })

  it('Add new Datadog health source for a monitored service ', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()

    cy.populateDefineHealthSource(Connectors.DATADOG, connectorIdentifier, 'Data dog')

    // selecting feature
    cy.contains('span', 'product is a required field').should('be.visible')
    cy.get('input[name="product"]').click({ force: true })
    cy.contains('p', 'Cloud Metrics').click()
    cy.contains('span', 'product is a required field').should('not.exist')

    cy.intercept('GET', dashboards.dashboardsAPI, errorResponse).as('dashboardsErrorResponse')

    cy.contains('span', 'Next').click()

    cy.wait('@dashboardsErrorResponse')
    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('be.visible')

    cy.intercept('GET', dashboards.dashboardsAPI, dashboards.dashboardsResponse).as('dashboardsResponse')

    cy.findByRole('button', { name: /Retry/i }).click()

    cy.wait('@dashboardsResponse')
    cy.contains('p', '+ Manually input query').click()

    cy.contains('h4', 'Add your Datadog query').should('be.visible')
    cy.fillField('metricName', 'Datadog Metric')

    //intercepting calls
    cy.intercept('GET', metrics.getMetricsCall, metrics.getMetricsResponse).as('getMetrics')
    cy.intercept('GET', metricTags.getMetricsTags, metricTags.getMetricsTagsResponse).as('getMetricsTags')
    cy.intercept('GET', activeMetrics.getActiveMetrics, activeMetrics.getActiveMetricsResponse).as('getActiveMetrics')

    cy.findByRole('button', { name: /Submit/i }).click()
    cy.contains('h3', 'Query Specifications').should('be.visible')

    // Triggering validations.
    cy.findByRole('button', { name: /Submit/i }).click()

    cy.wait('@getMetrics')
    cy.wait('@getActiveMetrics')

    // Check for form validations
    cy.contains('span', 'Group Name is required.').should('be.visible')
    cy.contains('span', 'Metric is required.').should('be.visible')
    cy.contains('span', 'One selection is required.').should('be.visible')

    // Adding group name
    cy.addingGroupName('group-1')

    // Selecting metric name
    cy.get('input[name="metric"]').click()
    cy.get('.Select--menuItem').click()

    // Fetching metric tags
    cy.wait('@getMetricsTags')

    // map metric to services
    cy.mapMetricToServices()

    // Creating the monitored service with Datadog health source.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.contains('span', 'Monitored Service created').should('be.visible')
  })

  it('should be able to create Datadog Health Source with existing dashboard', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.DATADOG, connectorIdentifier, 'Data dog')

    // selecting feature
    cy.contains('span', 'product is a required field').should('be.visible')
    cy.get('input[name="product"]').click({ force: true })
    cy.contains('p', 'Cloud Metrics').click()
    cy.contains('span', 'product is a required field').should('not.exist')

    cy.intercept('GET', dashboards.dashboardsAPI, errorResponse).as('dashboardsErrorResponse')

    cy.contains('span', 'Next').click()

    cy.wait('@dashboardsErrorResponse')
    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('be.visible')

    cy.intercept('GET', dashboards.dashboardsAPI, dashboards.dashboardsResponse).as('dashboardsResponse')

    cy.findByRole('button', { name: /Retry/i }).click()

    cy.wait('@dashboardsResponse')
    cy.contains('p', selectedDashboardName).click()

    //intercepting calls
    cy.intercept('GET', metrics.getMetricsCall, metrics.getMetricsResponse).as('getMetrics')
    cy.intercept('GET', metricTags.getMetricsTags, metricTags.getMetricsTagsResponse).as('getMetricsTags')
    cy.intercept('GET', activeMetrics.getActiveMetrics, activeMetrics.getActiveMetricsResponse).as('getActiveMetrics')
    cy.intercept('GET', dashboardDetails.getDashboardDetails, dashboardDetails.getDashboardDetailsResponse).as(
      'getDashboardDetails'
    )

    cy.findAllByRole('button', { name: /Next/i }).last().click()

    cy.wait('@getMetrics')
    cy.wait('@getActiveMetrics')
    cy.wait('@getDashboardDetails')
    cy.contains('h3', 'Query Specifications').should('be.visible')

    cy.wait('@getMetricsTags')

    // map metric to services
    cy.mapMetricToServices()

    // Creating the monitored service with Datadog health source.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.contains('span', 'Monitored Service created').should('be.visible')
  })

  it('should be able to edit an existing Data dog health source', () => {
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', dataDogMonitoredService)
    cy.wait(1000)

    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit service').click()
    cy.contains('div', 'DD new').click()

    //intercepting calls
    cy.intercept('GET', dashboards.dashboardsAPI, dashboards.dashboardsResponse).as('dashboardsResponse')
    cy.intercept('GET', metricTags.getMetricsTags, metricTags.getMetricsTagsResponse).as('getMetricsTags')

    cy.findByRole('button', { name: /Next/i }).click()
    cy.wait(1000)
    cy.wait('@dashboardsResponse')
    cy.findAllByRole('button', { name: /Next/i }).last().click()
    cy.wait('@getMetricsTags')

    //updating metric name and triggering submit
    cy.fillField('metricName', 'Datadog Metric updated')
    cy.findByRole('button', { name: /Submit/i }).click()

    // Updating the monitored service with Datadog health source.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.contains('span', 'Monitored Service updated').should('be.visible')
  })
})
