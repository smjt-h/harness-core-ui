import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Formik } from 'formik'
import { FormikForm } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { initialFormData } from '@cv/pages/slos/__tests__/CVSLOsListingPage.mock'
import type { ResponsePageUserJourneyResponse } from 'services/cv'
import SLOName from '../SLOName'
import { expectedUserJourneyOptions, mockedUserJourneysData } from './SLOName.mock'
import { getUserJourneysData } from '../SLOName.utils'

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props
  return (
    <TestWrapper>
      <Formik enableReinitialize={true} initialValues={initialValues} onSubmit={jest.fn()}>
        {formikProps => {
          return (
            <FormikForm>
              <SLOName formikProps={formikProps}>
                <></>
              </SLOName>
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

jest.mock('services/cv', () => ({
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

describe('Test SLOName component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render SLOName component', async () => {
    const { container, getByText } = render(<WrapperComponent initialValues={initialFormData} />)
    expect(getByText('cv.slos.sloName')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('Verify if user journeys are rendered ', async () => {
    const { container, getByText } = render(<WrapperComponent initialValues={initialFormData} />)
    const userJourneysDropdown = container.querySelector('input[name="cv.slos.userJourney"]') as HTMLInputElement
    expect(userJourneysDropdown).toBeInTheDocument()

    // opening the user journeys dropdown.
    const selectCaret = container
      .querySelector(`[name="cv.slos.userJourney"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(selectCaret!)
    })

    //Verify if the correct options coming from the api are present in the user journey dropdown.
    for (const el of mockedUserJourneysData.data.content) {
      expect(getByText(el.userJourney.name)).toBeInTheDocument()
    }
  })

  test('Verify getUserJourneysData method ', async () => {
    const actualUserJourneysData = getUserJourneysData(mockedUserJourneysData as ResponsePageUserJourneyResponse)
    expect(actualUserJourneysData).toEqual(expectedUserJourneyOptions)
  })
})
