import {
  getServiceLevelObjective,
  getServiceLevelObjectiveResponse,
  getSLORiskCount,
  getUserJourneysCall,
  listMonitoredServices,
  listMonitoredServicesCallResponse,
  listRiskCountDataEmptyResponse,
  listSLOsCall,
  listUserJourneysCallResponse,
  updatedListSLOsCallResponse,
  listSLOsCallForNewerProject,
  getSLORiskCountForNewerProject,
  getUserJourneysCallForNewerProject,
  listMonitoredServicesForNewerProject,
  getServiceLevelObjectiveForNewerProject,
  getServiceLevelObjectiveResponseForNewerProject,
  getSLODetails,
  responseSLODashboardDetail
} from '../../../support/85-cv/slos/constants'

describe('Changing Project Page', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.login('test', 'test')

    cy.visitChangeIntelligence()
  })

  it('should be able to switch project without any errors while editing the SLOs', () => {
    cy.intercept('GET', listMonitoredServices, listMonitoredServicesCallResponse)
    cy.intercept('GET', getSLORiskCount, listRiskCountDataEmptyResponse)
    cy.intercept('GET', getUserJourneysCall, listUserJourneysCallResponse)
    cy.intercept('GET', listSLOsCall, updatedListSLOsCallResponse).as('updatedListSLOsCallResponse')
    cy.intercept('GET', getSLODetails, responseSLODashboardDetail)
    cy.intercept('GET', getServiceLevelObjective, getServiceLevelObjectiveResponse).as('getSLO')

    cy.intercept('GET', listMonitoredServicesForNewerProject, listMonitoredServicesCallResponse)
    cy.intercept('GET', getSLORiskCountForNewerProject, listRiskCountDataEmptyResponse)
    cy.intercept('GET', getUserJourneysCallForNewerProject, listUserJourneysCallResponse)
    cy.intercept('GET', listSLOsCallForNewerProject, updatedListSLOsCallResponse)
    cy.intercept('GET', getServiceLevelObjectiveForNewerProject, getServiceLevelObjectiveResponseForNewerProject)

    cy.contains('p', 'SLOs').click()
    cy.wait('@updatedListSLOsCallResponse')

    // Editing a SLO
    cy.get('[data-icon="Options"]').click()
    cy.get('[icon="edit"]').click()
    cy.wait('@getSLO')

    // Changing the project
    cy.get('[data-testid=project-select-dropdown]').click()
    cy.contains('p', 'Project 2').click()

    // Changing project should not show error and render the slos list.
    cy.contains('h2', 'SLO-1').should('be.visible')
  })

  it('should not lose the selected project while switching between account and project scopes', () => {
    cy.contains('p', 'You have no monitored services')

    cy.contains('span', 'Account Settings').click()
    cy.contains('h2', 'Account Overview').should('be.visible')

    cy.contains('span', 'Service Reliability').click()

    cy.contains('p', 'You have no monitored services')
  })
})
