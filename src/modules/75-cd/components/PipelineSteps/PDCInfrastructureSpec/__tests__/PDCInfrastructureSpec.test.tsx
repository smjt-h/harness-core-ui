/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { PDCInfrastructureSpec } from '../PDCInfrastructureSpec'
import { ConnectorsResponse } from './mock/ConnectorsResponse.mock'
import { ConnectorResponse } from './mock/ConnectorResponse.mock'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(ConnectorsResponse.data)),
  useValidateSshHosts: jest.fn(() => jest.fn(() => ({ mutate: jest.fn() })))
}))

const getRuntimeInputsValues = () => ({
  connectorRef: RUNTIME_INPUT_VALUE
})

const getInitialValues = () => ({
  connectorRef: 'connectorRef'
})

const getEmptyInitialValues = () => ({
  connectorRef: ''
})

const getInvalidYaml = () => `p ipe<>line:
sta ges:
   - st<>[]age:
              s pe<> c: <> sad-~`

const getYaml = () => `pipeline:
    stages:
        - stage:
              spec:
                  infrastructure:
                      infrastructureDefinition:
                          type: PDC
                          spec:
                              connectorRef: account.connectorRef`

const getParams = () => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})

const connectorRefPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.connectorRef'

describe('Test PDCInfrastructureSpec snapshot', () => {
  beforeEach(() => {
    factory.registerStep(new PDCInfrastructureSpec())
  })

  test('should render edit view with empty initial values', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.PDC} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view with values ', () => {
    const { container } = render(
      <TestStepWidget initialValues={getInitialValues()} type={StepType.PDC} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view with runtime values ', () => {
    const { container } = render(
      <TestStepWidget initialValues={getRuntimeInputsValues()} type={StepType.PDC} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view for inputset view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.PDC}
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
        type={StepType.PDC}
        stepViewType={StepViewType.InputVariable}
      />
    )

    expect(container).toMatchSnapshot()
  })
})

describe('Test PDCInfrastructureSpec behavior', () => {
  beforeEach(() => {
    factory.registerStep(new PDCInfrastructureSpec())
  })

  test('should call onUpdate if valid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.PDC}
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
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })

    expect(onUpdateHandler).not.toHaveBeenCalled()
  })
})

describe('Test PDCInfrastructureSpec autocomplete', () => {
  test('Test connector autocomplete', async () => {
    const step = new PDCInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getConnectorsListForYaml(connectorRefPath, getYaml(), getParams())
    expect(list).toHaveLength(1)
    expect(list[0].insertText).toBe('Pdc')

    list = await step.getConnectorsListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    // TODO: create yaml that cause yaml.parse to throw an error
    // its expected that yaml.parse throw an error but is not happening
    list = await step.getConnectorsListForYaml(connectorRefPath, getInvalidYaml(), getParams())
    expect(list).toHaveLength(0)
  })
})
