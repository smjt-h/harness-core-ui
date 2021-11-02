import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { editParams } from '@cv/utils/routeUtils'
import { cvModuleParams } from '@cv/RouteDestinations'
import type { RestResponseServiceLevelObjectiveResponse } from 'services/cv'
import CVCreateSLO from '../CVCreateSLO'
import { mockedUserJourneysData } from '../components/CreateSLOForm/components/SLOName/__tests__/SLOName.mock'
import {
  expectedInitialValuesCreateFlow,
  expectedInitialValuesEditFlow,
  mockedSLODataById,
  mockPayloadForUpdateRequest
} from './CVCreateSLO.mock'
import { getInitialValuesSLO } from '../CVCreateSLO.utils'
import { createSLORequestPayload } from '../components/CreateSLOForm/CreateSLO.utils'
import type { SLOForm } from '../components/CreateSLOForm/CreateSLO.types'

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVEditSLOs({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}

const editFlowTestWrapperProps: TestWrapperProps = {
  path: routes.toCVEditSLOs({ ...accountPathProps, ...projectPathProps, ...editParams, ...cvModuleParams }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org',
    identifier: 'SLO5',
    module: 'cv'
  }
}

jest.mock('services/cv', () => ({
  useSaveSLOData: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useUpdateSLOData: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetServiceLevelObjective: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetAllJourneys: jest.fn().mockImplementation(() => ({
    data: mockedUserJourneysData,
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useSaveUserJourney: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false,
    error: null,
    refetch: jest.fn()
  }))
}))

describe('Test CVCreateSLO component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render CVCreateSLO component', async () => {
    const { getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <CVCreateSLO />
      </TestWrapper>
    )

    // Verify it Title is present and create flow is triigered
    expect(getByText('cv.slos.title')).toBeInTheDocument()
    expect(getByText('cv.slos.createSLO')).toBeInTheDocument()
  })

  test('verify getInitialValuesSLO method in create flow', async () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <CVCreateSLO />
      </TestWrapper>
    )
    expect(
      getInitialValuesSLO(
        testWrapperProps?.pathParams?.identifier as string,
        mockedSLODataById as RestResponseServiceLevelObjectiveResponse
      )
    ).toEqual(expectedInitialValuesCreateFlow)
  })

  test('verify edit Flow', async () => {
    const { getByText } = render(
      <TestWrapper {...editFlowTestWrapperProps}>
        <CVCreateSLO />
      </TestWrapper>
    )

    // Verify it Title is present and edit flow is triigered
    expect(getByText('cv.slos.title')).toBeInTheDocument()
    expect(getByText('cv.slos.editSLO')).toBeInTheDocument()
  })

  test('verify getInitialValuesSLO method in edit flow', async () => {
    render(
      <TestWrapper {...editFlowTestWrapperProps}>
        <CVCreateSLO />
      </TestWrapper>
    )
    expect(
      getInitialValuesSLO(
        editFlowTestWrapperProps?.pathParams?.identifier as string,
        mockedSLODataById as RestResponseServiceLevelObjectiveResponse
      )
    ).toEqual(expectedInitialValuesEditFlow)
  })

  test('verify createSLORequestPayload method', async () => {
    expect(createSLORequestPayload(expectedInitialValuesEditFlow as SLOForm, 'org-1', 'project-1')).toEqual(
      mockPayloadForUpdateRequest
    )
  })
})
