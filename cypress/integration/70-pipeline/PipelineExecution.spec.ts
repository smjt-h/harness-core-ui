import {
  executePipeline,
  pipelineListAPI,
  pipelinesRoute,
  serviceStepAPI,
  serviceStepStageID
} from '../../support/70-pipeline/constants'

describe('Pipeline Execution', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.initializeRoute()
    cy.intercept('POST', executePipeline, { fixture: 'pipeline/api/pipelineExecution/executePipeline' }).as(
      'executePipeline'
    )

    cy.intercept('GET', serviceStepAPI, { fixture: 'pipeline/api/pipelineExecution/serviceStep' }).as('serviceStep')
    cy.intercept('GET', serviceStepStageID, { fixture: 'pipeline/api/pipelineExecution/serviceStepStageID' })
      .as('serviceStepStageID')
      .wait(1000)

    cy.visit(pipelinesRoute, {
      timeout: 30000
    })
  })

  it('Pipeline Execution steps phases - Running & Failed', () => {
    cy.intercept('POST', pipelineListAPI, { fixture: '/pipeline/api/pipelineExecution/getPipelineList' }).as(
      'pipelineList'
    )
    cy.wait(2000)
    cy.wait('@pipelineList', {
      timeout: 10000
    })
    cy.wait(2000)

    cy.contains('span', 'Run').click()
    cy.wait(1000)
    cy.get('input[type="checkbox"]').eq(0).check({ force: true }).should('be.checked')
    cy.contains('span', 'Run Pipeline').click()
    cy.wait(1000)
    cy.wait('@serviceStep', { timeout: 30000 })
    cy.contains('span', 'Pipeline started successfully').should('be.visible')
    cy.wait('@serviceStepStageID', { timeout: 30000 })
    cy.wait(2000)
    cy.get('*[class^="ExecutionStatusLabel"]').should('be.visible')

    // asserting color for running-blue ( cypress matches rgba color)
    cy.get('*[class^="ExecutionStatusLabel"]').should('have.css', 'background-color').and('eq', 'rgb(2, 120, 213)')

    cy.get('*[class^="ExecutionStatusLabel"]').within(() => {
      cy.get('span[data-icon="loading"]').should('be.visible')
      cy.contains('span', 'RUNNING').should('be.visible')
    })
    cy.wait(3000)
    cy.contains('div', 'testPipeline_Cypressss').should('be.visible')

    cy.intercept('GET', serviceStepStageID, { fixture: 'pipeline/api/pipelineExecution/statusRunning' }).as(
      'statusRunning'
    )
    cy.wait('@statusRunning', { timeout: 30000 })
    cy.wait(2000)
    cy.intercept('GET', serviceStepStageID, { fixture: 'pipeline/api/pipelineExecution/statusFailed' }).as(
      'statusFailed'
    )

    cy.wait('@statusFailed', { timeout: 30000 })

    cy.get('.Pane.horizontal.Pane1').within(() => {
      cy.contains('p', 'testStage_Cypress').should('be.visible')
      cy.get('span[icon="warning-sign"]').should('be.visible')
      cy.get('span[icon="warning-sign"]').siblings().contains('p', "File 'src/' not found").should('be.visible')

      cy.get('.default-node').should('be.visible').trigger('mouseover')
      cy.get('.default-node').should('be.visible').trigger('onmouseover')
      cy.get('.default-node').should('be.visible').trigger('mouseenter')

      cy.get('span[data-popper-placement="right"]').should('be.visible')
      cy.get('span[data-popper-placement="right"]').within(() => {
        cy.get('span[icon="warning-sign"]')
          .should('be.visible')
          .siblings()
          .contains('span', 'FAILED')
          .should('be.visible')
        cy.contains('p', 'testService').should('be.visible')
        cy.contains('p', 'testEnv').should('be.visible')
      })

      cy.get('.default-node').should('be.visible').trigger('mouseleave')
      cy.wait(1000)
    })

    cy.get('.Pane.horizontal.Pane2').within(() => {
      cy.get('span[icon="warning-sign"]').should('be.visible')
      cy.contains('div', 'Error Summary').should('be.visible')

      cy.get('*[class^="StepDetailsTab"]')
        .should('be.visible')
        .within(() => {
          cy.get('span[data-icon="info"]')
            .should('be.visible')
            .siblings()
            .contains('span', "Provided file path doesn't exist")
            .should('be.visible')

          cy.contains(
            'span',
            "Failed while trying to fetch files from git connector: 'GitConn1' in manifest with identifier: ManifestIdentifier"
          ).should('be.visible')
          cy.get('span[icon="lightbulb"]')
            .should('be.visible')
            .siblings()
            .contains(
              'span',
              'Please ensure that provided file path exists in git repository or in reference branch: master'
            )
            .should('be.visible')
        })

      cy.contains('div', 'Error Summary').should('be.visible')
      cy.contains('p', "File 'src/' not found").should('be.visible')

      cy.get('span[icon="warning-sign"]')
        .should('be.visible')
        .siblings()
        .contains('span', 'FAILED')
        .should('be.visible')
      cy.contains('div', 'testService').should('be.visible')
      cy.contains('li', 'testEnv').should('be.visible')
    })
    cy.wait(2000)
  })

  it('Pipeline Execution steps phases - Running & Success', () => {
    cy.intercept('POST', pipelineListAPI, { fixture: '/pipeline/api/pipelineExecution/getPipelineList' }).as(
      'pipelineList'
    )
    cy.intercept('POST', executePipeline, {
      fixture: 'pipeline/api/pipelineExecution/successPipeline/executePipeline'
    }).as('executePipeline')

    cy.intercept('GET', serviceStepAPI, { fixture: 'pipeline/api/pipelineExecution/successPipeline/serviceStep' }).as(
      'serviceStep'
    )
    cy.intercept('GET', serviceStepStageID, {
      fixture: 'pipeline/api/pipelineExecution/successPipeline/serviceStepStageID'
    }).as('serviceStepStageID')
    cy.wait(2000)
    cy.wait('@pipelineList', {
      timeout: 10000
    })

    cy.contains('span', 'Run').click()
    cy.wait(1000)
    cy.get('input[type="checkbox"]').eq(0).check({ force: true }).should('be.checked')
    cy.contains('span', 'Run Pipeline').click()
    cy.wait(1000)
    cy.wait('@serviceStep', { timeout: 30000 })
    cy.contains('span', 'Pipeline started successfully').should('be.visible')
    cy.wait(1000)
    cy.wait('@serviceStepStageID', { timeout: 30000 })
    cy.wait(2000)
    cy.get('*[class^="ExecutionStatusLabel"]').should('be.visible')

    cy.get('*[class^="ExecutionStatusLabel"]').should('have.css', 'background-color').and('eq', 'rgb(2, 120, 213)')
    cy.get('*[class^="ExecutionStatusLabel"]').within(() => {
      cy.get('span[data-icon="loading"]').should('be.visible')
      cy.contains('span', 'RUNNING').should('be.visible')
    })

    cy.wait(3000)

    cy.intercept('GET', serviceStepStageID, {
      fixture: 'pipeline/api/pipelineExecution/successPipeline/statusRunning'
    })
      .as('statusRunning')
      .wait(1000)
    cy.wait('@statusRunning', { timeout: 30000 })
    cy.get("span[data-icon='spinner']").should('be.visible')

    cy.wait(2000)
    cy.intercept('GET', serviceStepStageID, {
      fixture: 'pipeline/api/pipelineExecution/successPipeline/statusSuccess'
    }).as('statusSuccess')

    cy.wait('@statusSuccess', { timeout: 30000 })
    cy.get('*[class^="ExecutionStatusLabel"]').should('have.css', 'background-color').and('eq', 'rgb(228, 247, 225)')
    cy.get("span[data-icon='execution-success']").should('be.visible')
    cy.get('*[class^="ExecutionStatusLabel"]').within(() => {
      cy.get('span[icon="tick-circle"]').should('be.visible')
      cy.contains('span', 'SUCCESS').should('be.visible')
    })

    cy.get('.Pane.horizontal.Pane1').within(() => {
      cy.get('.default-node').should('be.visible').trigger('mouseover')
      cy.get('.default-node').should('be.visible').trigger('onmouseover')
      cy.get('.default-node').should('be.visible').trigger('mouseenter')
      cy.get('span[data-popper-placement="right"]').should('be.visible')
      cy.get('span[data-popper-placement="right"]').within(() => {
        cy.get('span[icon="tick-circle"]')
          .should('be.visible')
          .siblings()
          .contains('span', 'SUCCESS')
          .should('be.visible')
        cy.contains('p', 'testService').should('be.visible')
        cy.contains('p', 'testEnv').should('be.visible')
      })
      cy.wait(1000)
    })
    cy.get('.Pane.horizontal.Pane2').within(() => {
      cy.get("span[data-icon='execution-success']").should('be.visible')
      cy.contains('div', 'testService').should('be.visible')
      cy.contains('li', 'testEnv').should('be.visible')
    })
  })
})
