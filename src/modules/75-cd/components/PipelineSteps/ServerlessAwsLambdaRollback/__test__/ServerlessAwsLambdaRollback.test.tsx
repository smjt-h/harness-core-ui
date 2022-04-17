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
import { ServerlessAwsLambdaRollbackStep } from '../ServerlessAwsLambdaRollback'
import { initialValuesMock, metaDataMapMock, variablesDataMock } from './mock'

const getRuntimeInputsValues = () => ({
  name: 'name',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    skipDryRun: RUNTIME_INPUT_VALUE
  },
  path: ''
})

const getInitialValues = () => ({
  name: 'name',
  timeout: '10s',
  spec: {
    skipDryRun: false
  },
  type: StepType.ServerlessAwsLambdaRollback
})

describe('Test ServerlessDeployStep snapshots - edit view', () => {
  beforeAll(() => {
    factory.registerStep(new ServerlessAwsLambdaRollbackStep())
  })

  test('Serverless Deploy Step rendering properly with empty initial values', () => {
    const { container } = render(
      <TestStepWidget
        // customStepProps={customStepProps}
        initialValues={{}}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('Serverless Deploy Step rendering properly with initial values', () => {
    const { container } = render(
      <TestStepWidget
        // customStepProps={customStepProps}
        initialValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('Serverless Deploy Step rendering properly with runtime initial values', () => {
    const { container } = render(
      <TestStepWidget
        // customStepProps={customStepProps}
        initialValues={getRuntimeInputsValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
describe('Test ServerlessDeployStep snapshots - inputSet view', () => {
  beforeAll(() => {
    factory.registerStep(new ServerlessAwsLambdaRollbackStep())
  })

  test('Serverless Deploy Step rendering properly with initial values', () => {
    const { container } = render(
      <TestStepWidget
        // customStepProps={customStepProps}
        initialValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })
})

describe('ServerlessDeploy step tests - inputSet view', () => {
  beforeAll(() => {
    factory.registerStep(new ServerlessAwsLambdaRollbackStep())
  })

  test('should call onUpdate if valid values entered', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })
    expect(onUpdateHandler).toHaveBeenCalledWith(getInitialValues())
  })

  test('should render skipDryRun checkbox field when skipDryRun is made runtime - inputset view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { findByLabelText } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.InputSet}
        ref={ref}
      />
    )
    const labelText = await findByLabelText('pipelineSteps.skipDryRun')
    expect(labelText).toBeTruthy()
  })
})

describe('ServerlessDeploy step tests - inputVariable view', () => {
  beforeAll(() => {
    factory.registerStep(new ServerlessAwsLambdaRollbackStep())
  })

  test('Variables list table is rendering properly', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.InputVariable}
        onUpdate={onUpdateHandler}
        customStepProps={{
          variablesData: variablesDataMock,
          metadataMap: metaDataMapMock,
          initialValues: initialValuesMock
        }}
      />
    )
    expect(container.getElementsByClassName('variablesListTable')).toBeTruthy()
  })
})

describe('ServerlessDeploy step tests - edit view', () => {
  beforeAll(() => {
    factory.registerStep(new ServerlessAwsLambdaRollbackStep())
  })

  test('should call onChange if valid values entered', async () => {
    const onChangeHandler = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getInitialValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.Edit}
        onChange={onChangeHandler}
        ref={ref}
      />
    )

    await act(async () => {
      const nameInput = container.querySelector('[placeholder="pipeline.stepNamePlaceholder"]')
      fireEvent.change(nameInput!, { target: { value: 'name changed' } })
    })

    await waitFor(() =>
      expect(onChangeHandler).toHaveBeenCalledWith({
        ...getInitialValues(),
        ...{ name: 'name changed', identifier: 'name_changed' }
      })
    )
  })

  test('should not call onChange if valid values entered but onChange is undefined', async () => {
    const onChangeHandler = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getInitialValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsLambdaRollback}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    await act(async () => {
      const nameInput = container.querySelector('[placeholder="pipeline.stepNamePlaceholder"]')
      fireEvent.change(nameInput!, { target: { value: 'name changed' } })
    })

    await waitFor(() => expect(onChangeHandler).not.toHaveBeenCalled())
  })
})
