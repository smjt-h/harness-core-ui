import {
  applicationCall,
  applicationsResponse,
  metricPackCall,
  metricPackResponse,
  tiersCall,
  tiersResponse
} from '../../../support/85-cv/monitoredService/health-sources/AppDynamics/constants'

describe('Create empty monitored service', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      return false
    })
    cy.login('test', 'test')
    cy.visitChangeIntelligence()
  })

  it('Add new monitored service ', () => {
    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    cy.contains('span', 'Add New Health Source').click()

    // Fill Define HealthSource Tab with AppDynamics
    cy.get('span[data-icon="service-appdynamics"]').click()
    cy.get('input[name="healthSourceName"]').type('AppD')
    cy.get('button[data-testid="cr-field-connectorRef"]').click()
    cy.contains('p', 'appdtest').click()
    cy.contains('span', 'Apply Selected').click()
    cy.contains('span', 'Next').click()

    // Fill Customise HealthSource Tab for AppDynamics
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')

    cy.get('input[name="appdApplication"]').click()
    cy.contains('p', 'cv-app').click({ force: true })

    cy.get('input[name="appDTier"]').click()
    cy.contains('p', 'docker-tier').click({ force: true })

    cy.contains('span', 'Submit').click()
  })
})
