import React from 'react'
import { render, act, fireEvent, queryByAttribute, waitFor } from '@testing-library/react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { TestStepWidget, factory } from '../../__tests__/StepTestUtil'
import { JiraApproval } from '../JiraApproval'
import { getDefaultCriterias } from '../helper'
import {
  getJiraApprovalInputVariableModeProps,
  getJiraApprovalDeploymentModeProps,
  mockConnectorResponse,
  mockProjectMetadataResponse,
  mockProjectsResponse,
  getJiraApprovalEditModeProps,
  getJiraApprovalEditModePropsWithValues
} from './JiraApprovalTestHelper'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

jest.mock('services/cd-ng', () => ({
  useGetConnector: () => mockConnectorResponse,
  useGetJiraProjects: () => mockProjectsResponse,
  useGetJiraIssueCreateMetadata: () => mockProjectMetadataResponse
}))

describe('Jira Approval tests', () => {
  beforeEach(() => {
    factory.registerStep(new JiraApproval())
  })

  test('Basic snapshot - inputset mode', async () => {
    const props = getJiraApprovalDeploymentModeProps()
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )

    fireEvent.click(getByText('Submit'))
    await waitFor(() => queryByText('Errors'))
    expect(container).toMatchSnapshot('input set with errors')
  })

  test('Basic snapshot - deploymentform mode', async () => {
    const props = getJiraApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={props.inputSetData}
      />
    )

    expect(container).toMatchSnapshot('jira-approval-deploymentform')
  })

  test('Basic snapshot - inputset mode but no runtime values', async () => {
    const props = getJiraApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        template={{ spec: { approvalCriteria: getDefaultCriterias(), rejectionCriteria: getDefaultCriterias() } }}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    expect(container).toMatchSnapshot('jira-approval-inputset-noruntime')
  })

  test('Basic snapshot - input variable view', () => {
    const props = getJiraApprovalInputVariableModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        template={{ spec: { approvalCriteria: getDefaultCriterias(), rejectionCriteria: getDefaultCriterias() } }}
        stepViewType={StepViewType.InputVariable}
        customStepProps={props.customStepProps}
      />
    )

    expect(container).toMatchSnapshot('jira-approval-input variable view')
  })

  test('Basic functions - edit stage view validations', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJiraApprovalEditModeProps()
    const { container, queryByText, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    // Submit with empty form
    await act(() => ref.current?.submitForm())
    expect(queryByText('pipelineSteps.stepNameRequired')).toBeTruthy()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'jira approval step' } })

    act(() => {
      fireEvent.click(getByText('pipelineSteps.timeoutLabel'))
    })
    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '' } })

    await act(() => ref.current?.submitForm())
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()

    fireEvent.click(getByText('pipeline.jiraApprovalStep.connectToJira'))
    await act(() => ref.current?.submitForm())

    expect(queryByText('pipeline.jiraApprovalStep.validations.project')).toBeTruthy()
    expect(queryByText('pipeline.jiraApprovalStep.validations.issueType')).toBeTruthy()
    expect(queryByText('pipeline.jiraApprovalStep.validations.issueKey')).toBeTruthy()

    fireEvent.click(getByText('pipeline.jiraApprovalStep.approvalCriteria'))
    expect(queryByText('pipeline.jiraApprovalStep.validations.expression')).toBeTruthy()
    fireEvent.click(getByText('conditions'))
    await waitFor(() => getByText('pipeline.jiraApprovalStep.validations.approvalCriteriaCondition'))
  })

  test('Open a saved jira approval step - edit stage view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJiraApprovalEditModePropsWithValues()
    const { container, getByText, queryByDisplayValue } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'jira approval step' } })
    expect(queryByDisplayValue('5s')).toBeTruthy()

    fireEvent.click(getByText('pipeline.jiraApprovalStep.connectToJira'))
    expect(queryByDisplayValue('pid1')).toBeTruthy()
    expect(queryByDisplayValue('tdc-2345')).toBeTruthy()
    expect(queryByDisplayValue('itd1')).toBeTruthy()

    fireEvent.click(getByText('pipeline.jiraApprovalStep.approvalCriteria'))
    expect(queryByDisplayValue('somevalue for f1')).toBeTruthy()

    fireEvent.click(getByText('pipeline.jiraApprovalStep.rejectionCriteria'))
    expect(queryByDisplayValue("<+status> == 'Blocked'")).toBeTruthy()
  })
})
