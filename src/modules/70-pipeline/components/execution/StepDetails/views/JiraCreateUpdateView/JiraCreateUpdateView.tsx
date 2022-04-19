/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty, merge } from 'lodash-es'
import { Tabs } from '@blueprintjs/core'

import { useStrings } from 'framework/strings'
import type { ExecutionNode, JiraIssueKeyNG } from 'services/pipeline-ng'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { InputOutputTab } from '@pipeline/components/execution/StepDetails/tabs/InputOutputTab/InputOutputTab'

import { StepDetailsTab } from '../../tabs/StepDetailsTab/StepDetailsTab'
import tabCss from '../DefaultView/DefaultView.module.scss'

export const REFRESH_APPROVAL = 'REFRESH_APPROVAL'

export interface JiraCreateUpdateViewProps extends StepDetailProps {
  step: ExecutionNode
}

export function JiraCreateUpdateView(props: JiraCreateUpdateViewProps): React.ReactElement | null {
  const { step } = props
  const issue = get(step, 'outcomes.issue', {}) as JiraIssueKeyNG
  const { getString } = useStrings()
  const labels = []
  if (!isEmpty(issue.url)) {
    labels.push({
      label: getString('pipeline.jiraApprovalStep.issueKey'),
      value: (
        <a href={issue.url} target="_blank" rel="noreferrer">
          {issue.key}
        </a>
      )
    })
  }
  return (
    <Tabs id="step-details" className={tabCss.tabs} renderActiveTabPanelOnly>
      <Tabs.Tab id="STEP_DETAILS" title={getString('details')} panel={<StepDetailsTab step={step} labels={labels} />} />
      <Tabs.Tab
        id="Input"
        title={getString('common.input')}
        panel={<InputOutputTab baseFqn={step.baseFqn} mode="input" data={step.stepParameters} />}
      />
      <Tabs.Tab
        id="Output"
        title={getString('outputLabel')}
        panel={
          <InputOutputTab
            baseFqn={step.baseFqn}
            mode="output"
            data={Array.isArray(step.outcomes) ? { output: merge({}, ...step.outcomes) } : step.outcomes}
          />
        }
      />
    </Tabs>
  )
}
