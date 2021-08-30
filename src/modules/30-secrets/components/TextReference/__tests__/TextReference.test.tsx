import React from 'react'
import { render } from '@testing-library/react'
import { noop } from 'lodash-es'
import { FormikForm, Formik } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import TextReference from '../TextReference'

jest.mock('services/cd-ng', () => ({
  getSecretV2Promise: jest.fn()
}))

describe('Text Reference', () => {
  test('render create mode', async () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={noop} formName="testWrapper">
          {() => {
            return (
              <FormikForm>
                <TextReference name="username" stringId="username" />
              </FormikForm>
            )
          }}
        </Formik>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test('render edit mode with text value', async () => {
    const { container } = render(
      <TestWrapper>
        <Formik
          formName="testWrapper"
          initialValues={{
            username: {
              value: 'test',
              type: 'TEXT'
            }
          }}
          onSubmit={noop}
        >
          {() => {
            return (
              <FormikForm>
                <TextReference name="username" stringId="username" />
              </FormikForm>
            )
          }}
        </Formik>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test('render edit mode with encrypted value', async () => {
    const { container } = render(
      <TestWrapper>
        <Formik
          formName="testWrapper"
          initialValues={{
            username: {
              value: 'test',
              type: 'ENCRYPTED'
            }
          }}
          onSubmit={noop}
        >
          {() => {
            return (
              <FormikForm>
                <TextReference name="username" stringId="username" />
              </FormikForm>
            )
          }}
        </Formik>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
