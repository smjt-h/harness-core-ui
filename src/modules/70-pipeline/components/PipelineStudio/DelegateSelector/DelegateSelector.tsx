/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikProps } from 'formik'

import { debounce } from 'lodash-es'
import type { StageElementWrapperConfig } from 'services/cd-ng'

import DelegateSelectorPanel from '@pipeline/components/PipelineSteps/AdvancedSteps/DelegateSelectorPanel/DelegateSelectorPanel'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import type { StepCommandsRef } from '../StepCommands/StepCommands'

export interface DelegateSelectorProps {
  selectedStage?: StageElementWrapperConfig
  isReadonly: boolean
  onUpdate(data: { delegateSelectors: string[] | string }): void
  tabName?: string
}

export function DelegateSelector(props: DelegateSelectorProps, ref: StepCommandsRef): React.ReactElement {
  const { selectedStage, onUpdate, isReadonly, tabName } = props
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = React.useCallback(debounce(onUpdate, 300), [onUpdate])
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  React.useEffect(() => {
    !!tabName && subscribeForm({ tab: tabName, form: formikRef })
    return () => {
      !!tabName && unSubscribeForm({ tab: tabName, form: formikRef })
    }
  }, [subscribeForm, unSubscribeForm, tabName])

  const selectedDelegateSelectors: string[] | string = selectedStage?.stage?.delegateSelectors || []

  return (
    <Formik
      initialValues={{
        delegateSelectors: selectedDelegateSelectors
      }}
      onSubmit={onUpdate}
      validate={debouncedUpdate}
    >
      {formik => {
        formikRef.current = formik
        return <DelegateSelectorPanel isReadonly={isReadonly} />
      }}
    </Formik>
  )
}

export const DelegateSelectorWithRef = React.forwardRef(DelegateSelector)
