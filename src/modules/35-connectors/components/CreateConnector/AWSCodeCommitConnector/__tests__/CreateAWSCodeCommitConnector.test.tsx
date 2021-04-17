import React from 'react'
import { Container, FormInput } from '@wings-software/uicore'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import CreateAWSCodeCommitConnector from '../CreateAWSCodeCommitConnector'

jest.mock('@secrets/components/SecretInput/SecretInput', () => () => (
  <Container className="secret-mock">
    <FormInput.Text name="secretKey" />
  </Container>
))

jest.mock('@connectors/pages/connectors/utils/ConnectorUtils', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...(jest.requireActual('@connectors/pages/connectors/utils/ConnectorUtils') as object),
  setSecretField: async () => ({
    identifier: 'secretIdentifier',
    name: 'secretName',
    referenceString: 'testReferenceString'
  })
}))

jest.mock('services/cd-ng', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...(jest.requireActual('services/cd-ng') as object),
  validateTheIdentifierIsUniquePromise: () =>
    Promise.resolve({
      status: 'SUCCESS',
      data: true,
      metaData: {},
      correlationId: ''
    }),
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: () =>
      Promise.resolve({
        data: { name: 'NewConnectorCreated' }
      })
  }))
}))

describe('CreateAWSCodeCommitConnector', () => {
  test('matches snapshot and goes through steps correctly', async () => {
    const onSuccess = jest.fn()
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAWSCodeCommitConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          isEditMode={false}
          setIsEditMode={noop}
          onSuccess={onSuccess}
          connectorInfo={undefined}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'TestName' }
      })
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="url"]')!, {
        target: { value: 'TestUrl' }
      })
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="accessKeytextField"]')!, {
        target: { value: 'accessKeyValue' }
      })
    })

    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'secretKey',
      value: 'secretKeyTestRef'
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    expect(onSuccess).toHaveBeenCalledWith({ name: 'NewConnectorCreated' })
  })
})
