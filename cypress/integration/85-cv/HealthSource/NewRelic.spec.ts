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
  metricPackCall,
  metricPackResponse,
  applicationCall,
  applicationResponse,
  metricDataCall,
  metricDataResponse,
  sampleDataResponse,
  sampleDataCall
} from '../../../support/85-cv/monitoredService/health-sources/NewRelic/constants'
import { Connectors } from '../../../utils/connctors-utils'

describe('Create empty monitored service', () => {
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

  it('Add new NewRelic monitored service ', () => {
    cy.intercept('GET', applicationCall, applicationResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', metricDataCall, metricDataResponse).as('MetricDataCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    // Fill Define HealthSource Tab with NewRelic
    cy.populateDefineHealthSource(Connectors.NEW_RELIC, 'NewRelicConn', 'NewRelic HS')
    cy.contains('span', 'Next').click()

    // Fill Customise HealthSource Tab for NewRelic
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')
    cy.wait(1000)

    cy.get('input[name="metricData.Performance"]').should('not.be.checked')

    // Validation
    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('span', 'Please select application').should('be.visible')
    cy.contains('span', 'Plese select metric packs').should('be.visible')

    cy.get('input[name="metricData.Performance"]').check({ force: true })
    cy.contains('span', 'Plese select metric packs').should('not.exist')

    cy.get('input[name="newRelicApplication"]').click()
    cy.contains('p', 'My Application').click({ force: true })
    cy.contains('span', 'Please select applications').should('not.exist')

    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div', 'NewRelic HS').click({ force: true })
    cy.contains('span', 'Next').click()

    cy.get('input[name="newRelicApplication"]').should('have.value', 'My Application')
    cy.get('input[name="metricData.Performance"]').should('be.checked')
    cy.contains('span', 'Submit').click({ force: true })

    // Creating the monitored service.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })

  it('Add new NewRelic monitored service with custom metric', () => {
    cy.intercept('GET', applicationCall, applicationResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', metricDataCall, metricDataResponse).as('MetricDataCall')
    cy.intercept('GET', sampleDataCall, sampleDataResponse).as('SampleDataCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    // Fill Define HealthSource Tab with NewRelic
    cy.populateDefineHealthSource(Connectors.NEW_RELIC, 'NewRelicConn', 'NewRelic HS')
    cy.contains('span', 'Next').click()

    // Fill Customise HealthSource Tab for NewRelic
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')

    cy.get('input[name="newRelicApplication"]').click()
    cy.contains('p', 'My Application').click({ force: true })
    cy.get('input[name="metricData.Performance"]').check({ force: true })

    cy.contains('span', 'Add Metric').click()

    // Custom validation
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Group Name is required').scrollIntoView().should('be.visible')

    cy.get('input[name="groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

    cy.contains('div', 'Query Specifications and mapping').click({ force: true })
    cy.get('textarea[name="query"]')
      .click({ force: true })
      .type(
        "SELECT average(`apm.service.transaction.duration`) FROM Metric WHERE appName = 'My Application' TIMESERIES"
      )
    cy.contains('span', 'Fetch records').click()

    cy.contains('div', 'Metric values and charts').click({ force: true })

    cy.contains('span', 'Select path for Metric value').click({ force: true })
    cy.wait(1000)
    cy.get('[class*="JsonSelector-module_selectableKey"]').first().click({ force: true })

    cy.contains('span', 'Select path for timestamp field').click({ force: true })
    cy.wait(1000)
    cy.get('[class*="JsonSelector-module_selectableKey"]').first().click({ force: true })

    cy.contains('div', 'Assign').click({ force: true })
    cy.get('input[name="sli"]').click({ force: true })

    cy.contains('span', 'Submit').click({ force: true })

    // Creating the monitored service.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })
})
