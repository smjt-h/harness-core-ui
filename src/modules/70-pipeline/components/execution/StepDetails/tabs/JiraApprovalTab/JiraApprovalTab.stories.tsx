import React from 'react'
import type { Story, Meta } from '@storybook/react'
// import styled from '@emotion/styled'
import { TestWrapper } from '@common/utils/testUtils'

import { JiraApprovalTab, JiraApprovalTabProps } from './JiraApprovalTab'
import jiraApprovalData from './__tests__/JiraAprovalData.json'

export default {
  title: 'Pipelines / Execution / JiraApprovalTab',
  component: JiraApprovalTab,
  argTypes: {
    type: {
      control: {
        type: 'radio',
        options: ['HarnessApproval', 'JiraApproval']
      }
    }
  }
} as Meta

export const Basic: Story<JiraApprovalTabProps> = args => {
  return (
    <TestWrapper>
      <JiraApprovalTab {...args} />
    </TestWrapper>
  )
}

Basic.args = {
  isWaiting: true,
  approvalData: jiraApprovalData as any
}
