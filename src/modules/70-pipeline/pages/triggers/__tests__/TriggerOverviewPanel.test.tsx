import React from 'react'
import { render, waitFor, queryByText } from '@testing-library/react'
import { Formik, FormikForm, Button } from '@wings-software/uicore'
import { renderHook } from '@testing-library/react-hooks'
import { useStrings } from 'framework/strings'
import { TestWrapper } from '@common/utils/testUtils'
import type { NGTriggerSource } from 'services/pipeline-ng'
import { getTriggerConfigDefaultProps, getTriggerConfigInitialValues } from './scheduleMockConstants'
import { getValidationSchema, TriggerTypes } from '../utils/TriggersWizardPageUtils'
import TriggerOverviewPanel from '../views/TriggerOverviewPanel'
const defaultTriggerConfigDefaultProps = getTriggerConfigDefaultProps({})

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props
  return (
    <TestWrapper>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={getValidationSchema(
          (TriggerTypes.SCHEDULE as unknown) as NGTriggerSource['type'],
          result.current.getString
        )}
        onSubmit={jest.fn()}
      >
        {formikProps => {
          return (
            <FormikForm>
              <TriggerOverviewPanel {...defaultTriggerConfigDefaultProps} formikProps={formikProps} />
              <Button text="Submit" className="submitButton" type="submit" />
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

describe('TriggerOverviewPanel Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Trigger Overview Panel', async () => {
      const { container } = render(<WrapperComponent initialValues={getTriggerConfigInitialValues({})} />)
      await waitFor(() =>
        queryByText(container, result.current.getString('pipeline-triggers.triggerOverviewPanel.title'))
      )
      expect(container).toMatchSnapshot()
    })
  })
})
