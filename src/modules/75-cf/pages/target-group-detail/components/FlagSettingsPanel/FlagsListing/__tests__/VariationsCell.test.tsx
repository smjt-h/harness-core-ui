/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { PERCENTAGE_ROLLOUT_VALUE } from '@cf/constants'
import { mockFeatures } from '@cf/pages/target-group-detail/__tests__/mocks'
import { FormValuesProvider, FormValuesProviderProps } from '@cf/hooks/useFormValues'
import VariationsCell, { VariationsCellProps } from '../VariationsCell'

const renderComponent = (
  props: Partial<VariationsCellProps> = {},
  formValuesProviderProps: Partial<FormValuesProviderProps> = {}
): RenderResult =>
  render(
    <TestWrapper>
      <Formik
        validateOnBlur
        formName="wrapper"
        onSubmit={jest.fn()}
        initialValues={formValuesProviderProps.values || {}}
      >
        {({ values, setFieldValue }) => (
          <FormValuesProvider values={values} setField={setFieldValue} {...formValuesProviderProps}>
            <VariationsCell row={{ original: mockFeatures[0] }} value={{ disabled: false }} {...props} />
          </FormValuesProvider>
        )}
      </Formik>
    </TestWrapper>
  )

describe('VariationsCell', () => {
  test('it should display the variation select', async () => {
    renderComponent()

    const input = screen.getByPlaceholderText('- cf.segmentDetail.selectVariation -')
    expect(input).toBeInTheDocument()

    userEvent.click(input)

    await waitFor(() => {
      mockFeatures[0].variations.forEach(({ name, identifier }) => {
        expect(screen.getByText(name || identifier)).toBeInTheDocument()
      })
    })
  })

  test('it should display the percentage rollout UI when Percentage Rollout is selected', async () => {
    const setFieldMock = jest.fn()
    const fieldPrefix = `flags.${mockFeatures[0].identifier}`

    renderComponent({}, { setField: setFieldMock })

    await waitFor(() => expect(setFieldMock).toHaveBeenCalledWith(`${fieldPrefix}.percentageRollout`, undefined))

    setFieldMock.mockClear()

    userEvent.click(screen.getByPlaceholderText('- cf.segmentDetail.selectVariation -'))

    await waitFor(() => expect(screen.getByText('cf.featureFlags.percentageRollout')).toBeInTheDocument())
    expect(screen.queryByTestId('variation-percentage-rollout')).not.toBeInTheDocument()

    userEvent.click(screen.getByText('cf.featureFlags.percentageRollout'))

    await waitFor(() => {
      expect(screen.getByTestId('variation-percentage-rollout')).toBeInTheDocument()
      expect(setFieldMock).toHaveBeenCalledTimes(mockFeatures[0].variations.length)

      mockFeatures[0].variations.forEach(({ identifier }, index) =>
        expect(setFieldMock).toHaveBeenCalledWith(
          `${fieldPrefix}.percentageRollout.variations[${index}].variation`,
          identifier
        )
      )
    })
  })

  test('it should display the percentage rollout error when an error exists', async () => {
    const errorMessage = 'cf.percentageRollout.invalidTotalError'

    renderComponent(
      {},
      {
        values: {
          flags: {
            [mockFeatures[0].identifier]: {
              variation: PERCENTAGE_ROLLOUT_VALUE,
              percentageRollout: {
                variations: [
                  { identifier: mockFeatures[0], weight: 101 },
                  { identifier: mockFeatures[1], weight: 10 }
                ]
              }
            }
          }
        },
        errors: {
          flags: {
            [mockFeatures[0].identifier]: {
              percentageRollout: {
                variations: errorMessage
              }
            }
          }
        }
      }
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })
})
