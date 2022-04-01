/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ServerlessAzureSpec } from '../ServerlessAzureSpec'
import { ConnectorResponse, MultipleConnectorsResponse } from './mock/ConnectorResponse.mock'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(MultipleConnectorsResponse.data))
}))

const getRuntimeInputsValues = () => ({
  connectorRef: RUNTIME_INPUT_VALUE,
  stage: RUNTIME_INPUT_VALUE
})

const getInitialValues = () => ({
  connectorRef: 'connectorRef',
  stage: 'stage'
})

const getEmptyInitialValues = () => ({
  connectorRef: '',
  stage: ''
})

describe('Test ServerlessAzureSpec snapshot', () => {
  beforeEach(() => {
    factory.registerStep(new ServerlessAzureSpec())
  })

  test('should render edit view with empty initial values', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.ServerlessAzure} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view with values ', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        type={StepType.ServerlessAzure}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view with runtime values ', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getRuntimeInputsValues()}
        type={StepType.ServerlessAzure}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view for inputset view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAzure}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAzure}
        stepViewType={StepViewType.InputVariable}
      />
    )

    expect(container).toMatchSnapshot()
  })
})

describe('Test ServerlessAzureSpec behavior', () => {
  beforeEach(() => {
    factory.registerStep(new ServerlessAzureSpec())
  })

  test('should call onUpdate if valid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAzure}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })
    expect(onUpdateHandler).toHaveBeenCalledWith(getInitialValues())
  })

  test('should not call onUpdate if invalid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getEmptyInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getEmptyInitialValues()}
        type={StepType.ServerlessAzure}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })

    expect(onUpdateHandler).not.toHaveBeenCalled()
  })

  test('should call onUpdate if valid values entered - edit view', async () => {
    const onUpdateHandler = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAzure}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdateHandler}
        ref={ref}
      />
    )

    await act(async () => {
      const stageInput = container.querySelector('[placeholder="cd.steps.serverless.stagePlaceholder"]')
      fireEvent.change(stageInput!, { target: { value: 'stage changed' } })

      // TODO: add other fields

      await ref.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdateHandler).toHaveBeenCalledWith({ ...getInitialValues(), ...{ stage: 'stage changed' } })
    )
  })
})
