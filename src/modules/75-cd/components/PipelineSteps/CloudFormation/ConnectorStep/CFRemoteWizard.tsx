/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, StepWizard } from '@harness/uicore'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { Connectors } from '@connectors/constants'
import {
  ConnectorMap,
  getBuildPayload,
  ConnectorTypes,
  GetNewConnector,
  ConnectorStepTitle
} from '../CloudFormationHelper'
import ConnectorStepOne from './ConnectorStepOne'
import { CFFileStore } from './CFFileStorePath'
import css from '../CloudFormation.module.scss'

const DIALOG_PROPS = {
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  style: {
    width: 1175,
    minHeight: 640,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden'
  }
}
interface Path {
  [key: string]: string
}

// interface StepChangeData<SharedObject> {
//   prevStep: number
//   nextStep: number
//   prevStepData: SharedObject
// }

const CFRemoteWizard = ({
  readonly,
  allowableTypes,
  showModal,
  onClose,
  isParam = false,
  initialValues,
  setFieldValue,
  index,
  regions
}: any) => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [isEditMode, setIsEditMode] = useState(false)
  const [showNewConnector, setShowNewConnector] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState('')
  const connectorStepTitle = getString(ConnectorStepTitle(isParam))
  const fileStoreTitle = getString(
    isParam ? 'cd.cloudFormation.parameterFileDetails' : 'cd.cloudFormation.templateFileStore'
  )
  // const onStepChange = (arg: StepChangeData<any>): void => {
  //   if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 2) {
  //     close()
  //   }
  // }
  const close = () => {
    setShowNewConnector(false)
    onClose()
  }
  const newConnector = (): JSX.Element => {
    const connectorType = ConnectorMap[selectedConnector]
    const buildPayload = getBuildPayload(connectorType as ConnectorTypes)
    return (
      <StepWizard iconProps={{ size: 37 }} title={getString('connectors.createNewConnector')}>
        <ConnectorDetailsStep
          type={connectorType}
          name={getString('overview')}
          isEditMode={isEditMode}
          connectorInfo={undefined}
        />
        <GitDetailsStep
          type={connectorType}
          name={getString('details')}
          isEditMode={isEditMode}
          connectorInfo={undefined}
        />
        {GetNewConnector(
          connectorType,
          isEditMode,
          setIsEditMode,
          accountId,
          projectIdentifier,
          orgIdentifier,
          getString('credentials')
        )}
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          buildPayload={buildPayload}
          connectorInfo={undefined}
        />
        <VerifyOutOfClusterDelegate
          name={getString('connectors.stepThreeName')}
          connectorInfo={undefined}
          isStep={true}
          isLastStep={false}
          type={connectorType}
        />
      </StepWizard>
    )
  }

  const onSubmit = (values: any, connector: any) => {
    const config = values?.spec?.configuration
    let paths = config?.templateFile?.spec?.store?.spec?.paths
    let connectorFieldName = 'spec.configuration.templateFile.spec.store.spec.connectorRef'
    let connectorRef = connector?.spec?.configuration?.templateFile?.spec?.store?.spec?.connectorRef
    if (isParam) {
      connectorRef = connector?.spec?.configuration?.parameters?.store?.spec?.connectorRef
    }

    if (isParam) {
      paths = config?.parameters?.store?.spec?.paths
      connectorFieldName = `spec.configuration.parameters[${index}].store.spec.connectorRef`
      setFieldValue(
        `spec.configuration.parameters[${index}].identifier`,
        values.spec.configuration.parameters.identifier
      )
      setFieldValue(
        `spec.configuration.parameters[${index}].store.type`,
        connectorRef?.connector?.type === Connectors.AWS ? 'S3Url' : connector?.connector?.type
      )
      setFieldValue(`spec.configuration.parameters[${index}].store.spec`, {
        ...values.spec.configuration.parameters.store.spec,
        paths: paths.map((filePath: Path) => filePath.path)
      })
      if (connector?.spec.configuration.parameters.store.spec?.region) {
        setFieldValue(
          `spec.configuration.parameters[${index}].store.spec.region`,
          connector?.spec.configuration.parameters.store.spec?.region
        )
      }
    } else {
      setFieldValue(`spec.configuration.templateFile.spec.store.spec`, {
        ...values.spec.configuration.templateFile.spec.store.spec,
        paths: paths.map((filePath: Path) => filePath.path)
      })
      setFieldValue(
        'spec.configuration.templateFile.spec.store.spec.paths',
        paths.map((filePath: Path) => filePath.path)
      )
    }
    setFieldValue(connectorFieldName, connectorRef)
    close()
  }

  return (
    <Dialog
      {...(DIALOG_PROPS as IDialogProps)}
      isOpen={showModal}
      isCloseButtonShown
      onClose={close}
      className={cx(css.modal, Classes.DIALOG)}
    >
      <div className={css.createTfWizard}>
        <StepWizard
          title={fileStoreTitle}
          className={css.configWizard}
          // onStepChange={onStepChange}
          icon="service-cloudformation"
          iconProps={{
            size: 50
          }}
        >
          <ConnectorStepOne
            isReadonly={readonly}
            allowableTypes={allowableTypes}
            name={connectorStepTitle}
            setShowNewConnector={setShowNewConnector}
            showNewConnector={showNewConnector}
            selectedConnector={selectedConnector}
            setSelectedConnector={setSelectedConnector}
            initialValues={initialValues}
            isParam={isParam}
            index={index}
            regions={regions}
          />
          {showNewConnector ? newConnector() : null}
          <CFFileStore
            name={fileStoreTitle}
            allowableTypes={allowableTypes}
            isParam={isParam}
            initialValues={initialValues}
            onSubmit={onSubmit}
            index={index}
          />
        </StepWizard>
      </div>
      <Button
        variation={ButtonVariation.ICON}
        icon="cross"
        iconProps={{ size: 18 }}
        onClick={close}
        className={css.crossIcon}
      />
    </Dialog>
  )
}

export default CFRemoteWizard
