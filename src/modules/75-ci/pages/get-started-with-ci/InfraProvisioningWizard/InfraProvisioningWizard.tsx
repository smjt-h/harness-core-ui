/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Text, Button, ButtonVariation, Layout, MultiStepProgressIndicator } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { InfraProvisioningCarousel } from '../InfraProvisioningCarousel/InfraProvisioningCarousel'
import {
  InfraProvisioningWizardProps,
  WizardStep,
  HostedByHarnessBuildLocation,
  InfraProvisiongWizardStepId,
  StepStatus
} from './Constants'
import { SelectBuildLocation } from './SelectBuildLocation'

import css from './InfraProvisioningWizard.module.scss'

export const InfraProvisioningWizard: React.FC<InfraProvisioningWizardProps> = props => {
  const { lastConfiguredWizardStepId = InfraProvisiongWizardStepId.SelectBuildLocation } = props
  const { getString } = useStrings()
  const [showDialog, setShowDialog] = useState<boolean>(false)
  const [currentWizardStepId, setCurrentWizardStepId] =
    useState<InfraProvisiongWizardStepId>(lastConfiguredWizardStepId)

  const [wizardStepStatus, setWizardStepStatus] = useState<Map<InfraProvisiongWizardStepId, StepStatus>>(
    new Map<InfraProvisiongWizardStepId, StepStatus>([
      [InfraProvisiongWizardStepId.SelectBuildLocation, StepStatus.ToDo],
      [InfraProvisiongWizardStepId.SelectVCSVendor, StepStatus.ToDo]
      // This is WIP
      // [InfraProvisiongWizardStepId.SelectCodeRepo, StepStatus.ToDo]
    ])
  )

  const updateStepStatus = React.useCallback((stepIds: InfraProvisiongWizardStepId[], status: StepStatus) => {
    if (Array.isArray(stepIds)) {
      setWizardStepStatus((prevState: Map<InfraProvisiongWizardStepId, StepStatus>) => {
        const clonedState = new Map(prevState)
        stepIds.forEach((item: InfraProvisiongWizardStepId) => clonedState.set(item, status))
        return clonedState
      })
    }
  }, [])

  const WizardSteps: Map<InfraProvisiongWizardStepId, WizardStep> = new Map([
    [
      InfraProvisiongWizardStepId.SelectBuildLocation,
      {
        stepRender: <SelectBuildLocation selectedBuildLocation={HostedByHarnessBuildLocation} />,
        onClickNext: () => {
          updateStepStatus([InfraProvisiongWizardStepId.SelectBuildLocation], StepStatus.InProgress)
          setShowDialog(true)
        },
        stepFooterLabel: 'ci.getStartedWithCI.configInfra'
      }
    ],
    [
      InfraProvisiongWizardStepId.SelectVCSVendor,
      {
        stepRender: (
          <Container>
            <Text>{getString('ci.getStartedWithCI.codeRepo')}</Text>
          </Container>
        ),
        onClickNext: () => {
          setCurrentWizardStepId(InfraProvisiongWizardStepId.SelectCodeRepo)
          updateStepStatus([InfraProvisiongWizardStepId.SelectVCSVendor], StepStatus.InProgress)
        },
        onClickBack: () => {
          setCurrentWizardStepId(InfraProvisiongWizardStepId.SelectBuildLocation)
          updateStepStatus(
            [InfraProvisiongWizardStepId.SelectBuildLocation, InfraProvisiongWizardStepId.SelectVCSVendor],
            StepStatus.ToDo
          )
        }
      }
    ]
  ])

  const { stepRender, onClickBack, onClickNext, stepFooterLabel } = WizardSteps.get(currentWizardStepId) ?? {}

  return stepRender ? (
    <Layout.Vertical
      padding={{ left: 'huge', right: 'huge', top: 'huge' }}
      flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
      height="100%"
    >
      <Layout.Vertical>
        <Container padding={{ top: 'large', bottom: 'large' }}>
          <MultiStepProgressIndicator
            progressMap={
              new Map([
                [0, wizardStepStatus.get(InfraProvisiongWizardStepId.SelectBuildLocation) || 'TODO'],
                [1, wizardStepStatus.get(InfraProvisiongWizardStepId.SelectVCSVendor) || 'TODO']
                // [2, wizardStepStatus.get(InfraProvisiongWizardStepId.SelectCodeRepo) || 'TODO']
              ])
            }
          />
        </Container>
        {stepRender}
      </Layout.Vertical>
      {showDialog ? (
        <InfraProvisioningCarousel
          show={showDialog}
          provisioningStatus="IN_PROGRESS"
          onClose={() => {
            setShowDialog(false)
            updateStepStatus([InfraProvisiongWizardStepId.SelectBuildLocation], StepStatus.Success)
            updateStepStatus([InfraProvisiongWizardStepId.SelectVCSVendor], StepStatus.InProgress)
            setCurrentWizardStepId(InfraProvisiongWizardStepId.SelectVCSVendor)
          }}
        />
      ) : null}
      <Layout.Horizontal
        spacing="medium"
        padding={{ top: 'large', bottom: 'xlarge' }}
        className={css.footer}
        width="100%"
      >
        {currentWizardStepId !== 'SELECT_BUILD_LOCATION' ? (
          <Button
            variation={ButtonVariation.SECONDARY}
            text={getString('back')}
            icon="chevron-left"
            minimal
            onClick={() => onClickBack?.()}
          />
        ) : null}
        <Button
          text={getString(stepFooterLabel ?? 'next')}
          variation={ButtonVariation.PRIMARY}
          rightIcon="chevron-right"
          onClick={() => onClickNext?.()}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  ) : null
}
