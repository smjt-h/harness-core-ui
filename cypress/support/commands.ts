/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import '@testing-library/cypress/add-commands'
import {
  servicesCall,
  servicesResponse,
  environmentsCall,
  environmentResponse
} from './85-cv/monitoredService/constants'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    /* eslint-disable @typescript-eslint/no-unused-vars  */
    interface Chainable<Subject> {
      login(username: string, pass: string): void
      visitCreatePipeline(): void
      visitPipelinesList(): void
      visitChangeIntelligence(): void
      fillName(name: string): void
      clickSubmit(): void
      fillField(fieldName: string, value: string): void
      addNewMonitoredServiceWithServiceAndEnv(): void
    }
  }
}

Cypress.Commands.add('clickSubmit', () => {
  cy.get('[type="submit"]').click()
})

Cypress.Commands.add('fillField', (fieldName: string, value: string) => {
  cy.get(`[name="${fieldName}"]`).clear().type(value)
})

Cypress.Commands.add('login', (emailValue: string, password: string) => {
  cy.visit('#/login')
  cy.get('[data-id="email-0"] input').clear().type(emailValue)
  cy.get('[data-id="password-1"] input').clear().type(password)
  cy.clickSubmit()
})

Cypress.Commands.add('visitPipelinesList', () => {
  cy.contains('p', 'Projects').click()
  cy.contains('p', 'Project 1').click()
  cy.contains('p', 'Delivery').click()
  cy.contains('p', 'Pipelines').click()
})

Cypress.Commands.add('visitCreatePipeline', () => {
  cy.visitPipelinesList()
  cy.contains('span', 'Create a Pipeline').click()
})

Cypress.Commands.add('fillName', (value: string) => {
  cy.fillField('name', value)
})

// Change Intelligence commands
Cypress.Commands.add('visitChangeIntelligence', () => {
  cy.contains('span', 'Service Reliability').click()
  cy.contains('p', 'Select a Project').click()
  cy.contains('p', 'Project 1').click()
})

Cypress.Commands.add('addNewMonitoredServiceWithServiceAndEnv', () => {
  cy.intercept('GET', servicesCall, servicesResponse).as('ServiceCall')
  cy.intercept('GET', environmentsCall, environmentResponse).as('EnvCall')

  cy.contains('span', 'New Monitored Service').click()
  cy.wait('@ServiceCall')
  cy.wait('@EnvCall')
  cy.wait(1000)

  // clear any cached values
  cy.get('body').then($body => {
    if ($body.text().includes('Unsaved changes')) {
      cy.contains('span', 'Discard').click()
    }
  })

  cy.contains('div', 'Unsaved changes').should('not.exist')
  cy.get('button').contains('span', 'Discard').parent().should('be.disabled')

  cy.get('button').contains('span', 'Save').click()

  // Check valiadtions
  cy.contains('span', 'Service is required').should('be.visible')
  cy.contains('span', 'Environment is required').should('be.visible')
  cy.contains('span', 'Monitored Service Name is required').should('be.visible')

  cy.get('input[name="service"]').click()
  cy.contains('p', 'Service 101').click({ force: true })

  cy.contains('span', 'Service is required').should('not.exist')

  cy.get('input[name="environment"]').click()
  cy.contains('p', 'QA').click({ force: true })

  cy.contains('span', 'Environment is required').should('not.exist')
  cy.contains('span', 'Monitored Service Name is required').should('not.exist')

  cy.contains('div', 'Unsaved changes').scrollIntoView().should('be.visible')
  cy.get('button').contains('span', 'Discard').parent().should('be.enabled')
})
