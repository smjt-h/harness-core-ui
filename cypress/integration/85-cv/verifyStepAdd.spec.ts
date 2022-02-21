import {
  monitoresServices,
  monitoresServicesResponse,
  pipelineSteps,
  pipelineStepsResponse,
  servicesCall,
  strategies,
  strategiesResponse,
  strategiesYamlSnippets,
  strategiesYamlSnippetsResponse,
  variables,
  variablesPostResponse
} from '../../support/85-cv/verifyStep/constants'

describe('Verify step add', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.login('test', 'test')

    cy.visitVerifyStepInPipeline()
    cy.fillName('testPipeline_Cypress')
    cy.get('[type="submit"]').click()
  })

  it('should check verify step add inputs are correct as given', () => {
    cy.intercept(
      'POST',
      '/pipeline/api/pipelines?accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default',
      {
        status: 'SUCCESS',
        message: null,
        correlationId: 'd174366f-e2dd-4e9a-8474-df2d47c12bec',
        detailedMessage: null,
        responseMessages: []
      }
    ).as('pipelineSave')
    cy.intercept('GET', strategies, strategiesResponse).as('strategiesList')
    cy.intercept('GET', strategiesYamlSnippets, strategiesYamlSnippetsResponse).as('strategiesYaml')
    cy.intercept('GET', monitoresServices, monitoresServicesResponse).as('monitoredServices')
    cy.intercept('POST', variables, variablesPostResponse).as('variables')
    cy.intercept('POST', pipelineSteps, pipelineStepsResponse).as('pipelineSteps')
    cy.intercept('GET', servicesCall, { fixture: 'ng/api/servicesV2' }).as('service')

    cy.get('[icon="plus"]').click()
    cy.findByTestId('stage-Deployment').click()

    cy.fillName('testStage_Cypress')
    cy.clickSubmit()

    cy.wait('@service')

    // service definition
    cy.wait(1000)
    cy.get('input[name="serviceRef"]').click({ force: true })
    cy.contains('p', 'testService').click({ force: true })

    // Infrastructure definition
    cy.contains('span', 'Infrastructure').click({ force: true })
    cy.wait(1000)
    cy.get('input[name="environmentRef"]').click({ force: true })
    cy.contains('p', 'testEnv').click({ force: true })
    cy.wait(1000)

    cy.contains('p', /^Kubernetes$/).click()
    cy.wait(1000)

    cy.contains('span', 'Select Connector').click({ force: true })
    cy.contains('p', 'test1111').click({ force: true })
    cy.contains('span', 'Apply Selected').click({ force: true })

    cy.fillField('namespace', 'verify-step')
    cy.wait(1000)

    // Execution definition
    cy.findByTestId('execution').click()
    cy.wait(2000)

    // choosing deployment strategy
    cy.findByRole('button', { name: /Use Strategy/i }).click()
    cy.wait(1000)

    // adding new step
    cy.findByText(/Add step/i).click()
    cy.findByTestId('addStepPipeline').click()
    cy.wait(1000)

    // click verify step
    cy.findByText(/Verify/i).click()

    cy.fillName('test_verify')

    cy.get('input[name="spec.type"]').click({ force: true })
    cy.contains('p', 'Rolling Update').click({ force: true })
    cy.get('input[name="spec.spec.sensitivity"]').click({ force: true })
    cy.contains('p', 'High').click({ force: true })
    cy.get('input[name="spec.spec.duration"]').click({ force: true })
    cy.contains('p', '5 min').click({ force: true })

    cy.findByRole('button', { name: /Apply Changes/i }).click()

    cy.wait(2000)

    cy.findByRole('button', { name: /^Save$/i }).click({ force: true })

    cy.wait(500)

    cy.findByText('Pipeline published successfully').should('be.visible')

    cy.wait('@pipelineSave').then(interception => {
      expect(interception.request.body).includes('type: Verify')
      expect(interception.request.body).includes('sensitivity: HIGH')
      expect(interception.request.body).includes('duration: 5m')
      expect(interception.request.body).includes('deploymentTag: <+serviceConfig.artifacts.primary.tag>')
      expect(interception.request.body).includes('timeout: 2h')
    })
  })
})
