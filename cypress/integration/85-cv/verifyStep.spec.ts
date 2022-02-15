const servicesCall =
  '/ng/api/servicesV2?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'

describe('Verify step', () => {
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

  it('should open pipelines', () => {
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

    cy.findByRole('button', { name: /^Save$/i }).click({ force: true })

    cy.wait(500)

    // cy.findByText('Pipeline published successfully').should('be.visible')

    // cy.wait('@pipelineSave').its('request.body').should('include', `type: Verify`)
  })
})
