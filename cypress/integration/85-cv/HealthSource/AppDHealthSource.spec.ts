import {
  applicationCall,
  applicationsResponse,
  metricPackCall,
  metricPackResponse,
  tiersCall,
  tiersResponse,
  basePathCall,
  basePathResponse,
  metricStructureCall,
  metricStructureResponse
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
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

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
    cy.wait(1000)

    cy.get('input[name="metricData.Errors"]').should('be.checked')
    cy.get('input[name="metricData.Performance"]').should('be.checked')

    // Validation
    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('span', 'Please select applications').should('be.visible')

    cy.get('input[name="metricData.Errors"]').uncheck({ force: true })
    cy.get('input[name="metricData.Performance"]').uncheck({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Plese select metric packs').should('be.visible')
    cy.get('input[name="metricData.Errors"]').check({ force: true })
    cy.get('input[name="metricData.Performance"]').check({ force: true })
    cy.contains('span', 'Plese select metric packs').should('not.exist')

    cy.get('input[name="appdApplication"]').click()
    cy.contains('p', 'cv-app').click({ force: true })

    // Validation
    cy.contains('span', 'Please select applications').should('not.exist')
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Please select tier').should('be.visible')

    cy.wait('@TierCall')
    cy.get('input[name="appDTier"]').click()
    cy.contains('p', 'docker-tier').click({ force: true })

    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div', 'AppD').click({ force: true })
    cy.contains('span', 'Next').click()

    cy.get('input[name="appDTier"]').should('have.value', 'docker-tier')
    cy.get('input[name="appdApplication"]').should('have.value', 'cv-app')
    cy.contains('span', 'Submit').click({ force: true })
  })

  it('Add new monitored service with custom metric', () => {
    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

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

    cy.wait('@TierCall')
    cy.get('input[name="appDTier"]').click()
    cy.contains('p', 'docker-tier').click({ force: true })

    // Adding custom metric should make metric pack oprional
    cy.get('input[name="metricData.Errors"]').uncheck({ force: true })
    cy.get('input[name="metricData.Performance"]').uncheck({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Plese select metric packs').should('be.visible')
    cy.contains('span', 'Add Metric').click()
    cy.contains('span', 'Plese select metric packs').should('not.exist')

    cy.contains('div', 'Assign').click({ force: true })

    // Custom validation
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Group Name is required').should('be.visible')
    cy.contains('span', 'Please select base path').scrollIntoView().should('be.visible')
    cy.contains('span', 'One selection is required.').scrollIntoView().should('be.visible')

    cy.get('input[name="groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

    cy.get('input[name="basePath"]').click()
    cy.contains('p', 'Overall Application Performance').click({ force: true })

    cy.get('input[name="metricPathDropdown"]').click()
    cy.contains('p', 'Calls per Minute').click({ force: true })

    cy.get('input[name="sli"]').click({ force: true })

    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div', 'AppD').click({ force: true })
    cy.contains('span', 'Next').click()

    cy.get('input[name="appDTier"]').should('have.value', 'docker-tier')
    cy.get('input[name="appdApplication"]').should('have.value', 'cv-app')
    cy.get('input[name="groupName"]').should('have.value', 'group 1')
    cy.get('input[name="metricName"]').should('have.value', 'appdMetric')
    cy.get('input[name="basePath"]').should('have.value', 'Overall Application Performance')
    cy.get('input[name="metricPathDropdown"]').should('have.value', 'Calls per Minute')
    cy.contains('p', 'Overall Application Performance / docker-tier / Calls per Minute')
      .scrollIntoView()
      .should('be.visible')
    cy.contains('span', 'Submit').click({ force: true })
  })
})
