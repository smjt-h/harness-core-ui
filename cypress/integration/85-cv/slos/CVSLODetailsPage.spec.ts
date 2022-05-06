import {
  changeEventListResponse,
  changeEventTimelineResponse,
  errorResponse,
  getChangeEventList,
  getChangeEventTimeline,
  getMonitoredService,
  getMonitoredServiceChangeEventSummary,
  getMonitoredServiceResponse,
  getServiceLevelObjective,
  getServiceLevelObjectiveResponse,
  getSLODetails,
  getSLORiskCount,
  getSLORiskCountResponse,
  getUserJourneysCall,
  listMonitoredServices,
  listMonitoredServicesCallResponse,
  listRiskCountDataEmptyResponse,
  listSLOsCall,
  listSLOsCallWithCVNGProd,
  listSLOsCallResponse,
  listUserJourneysCallResponse,
  monitoredServiceChangeEventSummaryResponse,
  responseSLODashboardDetailOfCalendarType,
  updatedListSLOsCallResponse,
  getSLORiskCountWithCVNGProd,
  getChangeEventDetail,
  changeEventDetailsResponse,
  getSLOExecutionLogs,
  getSLOExecutionLogsResponse,
  getSLO_APICallLogs,
  getSLO_APICallLogsResponse
} from '../../../support/85-cv/slos/constants'

describe('CVSLODetailsPage', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.login('test', 'test')
    cy.visitChangeIntelligence()

    cy.intercept('GET', listSLOsCall, updatedListSLOsCallResponse)
    cy.intercept('GET', getUserJourneysCall, listUserJourneysCallResponse)
    cy.intercept('GET', listMonitoredServices, listMonitoredServicesCallResponse)
    cy.intercept('GET', getSLORiskCount, getSLORiskCountResponse)
    cy.intercept('GET', getMonitoredService, getMonitoredServiceResponse)
    cy.intercept('GET', getChangeEventTimeline, changeEventTimelineResponse)
  })

  it('should handle the errors and render the details page', () => {
    cy.intercept('GET', getSLODetails, errorResponse)
    cy.intercept('GET', getMonitoredServiceChangeEventSummary, monitoredServiceChangeEventSummaryResponse)
    cy.intercept('GET', getChangeEventList, errorResponse)

    cy.contains('p', 'SLOs').click()
    cy.contains('h2', 'SLO-1').click()

    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('be.visible')

    cy.intercept('GET', getSLODetails, responseSLODashboardDetailOfCalendarType)

    cy.contains('span', 'Retry').click()

    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.')
      .scrollIntoView()
      .should('be.visible')

    cy.intercept('GET', getChangeEventList, changeEventListResponse)

    cy.contains('span', 'Retry').click()
    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('not.exist')
  })

  it('should handle the Details tab options', () => {
    cy.intercept('GET', getSLODetails, responseSLODashboardDetailOfCalendarType)
    cy.intercept('GET', getMonitoredServiceChangeEventSummary, monitoredServiceChangeEventSummaryResponse)
    cy.intercept('GET', getChangeEventList, changeEventListResponse)

    cy.contains('p', 'SLOs').click()
    cy.contains('h2', 'SLO-1').click()

    cy.intercept('GET', getServiceLevelObjective, getServiceLevelObjectiveResponse)
    cy.findByRole('button', { name: /Edit/i }).click()
    cy.contains('h2', 'Define SLO identification').should('be.visible')
    cy.contains('div', 'Details').click()

    cy.findByRole('button', { name: /Reset Error Budget/i }).click()
    cy.contains('h4', 'Reset Error Budget').should('be.visible')
    cy.findByRole('button', { name: /Cancel/i }).click()

    cy.intercept('GET', getSLOExecutionLogs, getSLOExecutionLogsResponse).as('getSLOExecutionLogsResponse')
    cy.findByRole('button', { name: /Execution Logs/i }).click()
    cy.contains('h2', 'Execution Logs').should('be.visible')
    cy.wait('@getSLOExecutionLogsResponse')
    cy.get('[data-icon="Stroke"]').click()

    cy.intercept('GET', getSLO_APICallLogs, getSLO_APICallLogsResponse).as('getSLO_APICallLogsResponse')
    cy.findByRole('button', { name: /External API Calls/i }).click()
    cy.contains('h2', 'External API Calls').should('be.visible')
    cy.wait('@getSLO_APICallLogsResponse')
    cy.get('[data-icon="Stroke"]').click()

    cy.findByRole('button', { name: /Delete/i }).click()
    cy.contains('p', 'Delete SLO-1?').should('be.visible')
    cy.intercept('GET', getSLORiskCount, listRiskCountDataEmptyResponse)
    cy.intercept('GET', listSLOsCall, listSLOsCallResponse)
    cy.get('.bp3-dialog')
      .findByRole('button', { name: /Delete/i })
      .click()
    cy.contains('h2', 'You don’t have any SLO created yet').should('be.visible')
  })

  it('should render the Service Details card with data and by clicking the MS name it should redirect to MS details page', () => {
    cy.intercept('GET', getSLODetails, responseSLODashboardDetailOfCalendarType)
    cy.intercept('GET', getMonitoredServiceChangeEventSummary, monitoredServiceChangeEventSummaryResponse)
    cy.intercept('GET', getChangeEventList, changeEventListResponse)

    cy.contains('p', 'SLOs').click()
    cy.contains('h2', 'SLO-1').click()

    cy.contains('p', 'Service Details').should('be.visible')

    cy.contains('p', 'SLI Type').next().should('contain.text', 'Latency')
    cy.contains('p', 'Health Score').next().should('contain.text', 'appd_cvng_prod')
    cy.contains('p', 'Period Type').next().should('contain.text', 'Calendar')

    cy.contains('p', 'Error Budget Remaining').next().should('contain.text', '100.00%')
    cy.contains('p', 'Time Remaining').next().should('contain.text', '6')

    cy.intercept('GET', listSLOsCallWithCVNGProd, updatedListSLOsCallResponse)
    cy.intercept('GET', getSLORiskCountWithCVNGProd, getSLORiskCountResponse)
    cy.get('.bp3-card').contains('p', 'Monitored Service').next().click()

    cy.contains('div', 'Service Health').should('be.visible')
  })

  it('should handle the time range filters and ensure the timeline slider functionality', () => {
    cy.intercept('GET', getSLODetails, responseSLODashboardDetailOfCalendarType)
    cy.intercept('GET', getMonitoredServiceChangeEventSummary, monitoredServiceChangeEventSummaryResponse)
    cy.intercept('GET', getChangeEventList, changeEventListResponse)

    cy.contains('p', 'SLOs').click()
    cy.contains('h2', 'SLO-1').click()

    cy.findByRole('button', { name: /1 Hour/i }).click()
    cy.findByRole('button', { name: /1 Hour/i }).should('have.class', 'Button--variation-secondary')

    cy.findByTestId('timeline-slider-container').click()

    cy.findByRole('button', { name: /Zoom/i }).click()
    cy.findByRole('button', { name: /1 Hour/i }).should('not.have.class', 'Button--variation-secondary')
    cy.findByRole('button', { name: /Custom/i }).should('have.class', 'Button--variation-secondary')

    cy.get('.bp3-card').contains('span', 'Reset').click()
    cy.get('.bp3-card').contains('span', 'Reset').should('not.exist')

    cy.findByRole('button', { name: /Custom/i }).should('not.have.class', 'Button--variation-secondary')
  })

  it('should open the Change details drawer by clicking on the Change', () => {
    cy.intercept('GET', getSLODetails, responseSLODashboardDetailOfCalendarType)
    cy.intercept('GET', getMonitoredServiceChangeEventSummary, monitoredServiceChangeEventSummaryResponse)
    cy.intercept('GET', getChangeEventList, changeEventListResponse)

    cy.contains('p', 'SLOs').click()
    cy.contains('h2', 'SLO-1').click()

    cy.contains('p', 'Service Details').should('be.visible')
    cy.get('.bp3-card').contains('p', 'Changes').scrollIntoView().should('be.visible')

    cy.intercept('GET', getChangeEventDetail, changeEventDetailsResponse)
    cy.get('.TableV2--body').children().first().click()

    cy.contains('p', 'Deployment of cvng in prod').should('be.visible')
  })
})
