/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import routes from '@common/RouteDefinitions'
import { TemplateContextTestWrapper } from '@templates-library/utils/templateContextTestUtils'

import { TemplateStudio } from '../TemplateStudio'

const updateTemplate = jest.fn()
const updateTemplateView = jest.fn()

const testWrapperProps = {
  path: routes.toTemplateStudio({
    accountId: ':accountId',
    orgIdentifier: ':orgIdentifier',
    projectIdentifier: ':projectIdentifier',
    templateType: ':templateType',
    templateIdentifier: ':templateIdentifier'
  }),
  pathParams: {
    accountId: 'dummy',
    orgIdentifier: 'dummy',
    projectIdentifier: 'dummy',
    templateType: 'dummy',
    templateIdentifier: 'dummy'
  },
  queryParams: {
    versionLabel: 'dummy'
  }
}

describe('<TemplateStudio /> tests', () => {
  test('snapshot test for new template', () => {
    const newTemplateProps = {
      ...testWrapperProps,
      pathParams: {
        ...testWrapperProps.pathParams,
        templateIdentifier: '-1'
      },
      templateContextValues: {
        state: {
          template: null
        }
      }
    }
    const { container } = render(
      <TemplateContextTestWrapper {...(newTemplateProps as any)}>
        <TemplateStudio />
      </TemplateContextTestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('snapshot test for template studio in visual view', () => {
    const { container } = render(
      <TemplateContextTestWrapper {...testWrapperProps}>
        <TemplateStudio />
      </TemplateContextTestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('view change toggling in template studio', () => {
    /**
     * View change to yaml loads yaml builder
     * View change back to visual checks if valid yaml has been entered
     * Click on same view does not trigger any change
     */
    const { container } = render(
      <TemplateContextTestWrapper
        {...testWrapperProps}
        templateContextValues={{
          updateTemplate: updateTemplate,
          updateTemplateView: updateTemplateView
        }}
      >
        <TemplateStudio />
      </TemplateContextTestWrapper>
    )

    const toggle = container.querySelector('[data-name="toggle-option-two"]')
    userEvent.click(toggle!)
    expect(toggle?.className).toContain('PillToggle--selected')

    const toggle2 = container.querySelector('[data-name="toggle-option-one"]')
    userEvent.click(toggle2!)
    waitFor(() => expect(toggle2?.className).toContain('PillToggle--selected'))

    userEvent.click(toggle2!)
    waitFor(() => expect(toggle2?.className).not.toEqual('PillToggle--item'))
  })
})
