/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import {
  Layout,
  Button,
  Formik,
  Text,
  StepProps,
  Container,
  ButtonVariation,
  PageSpinner,
  HarnessDocTooltip,
  FormInput
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import type { ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'
import { setupPDCFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import UploadJSON from '../components/UploadJSON'

import css from '../CreatePdcConnector.module.scss'

interface PdcDetailsProps {
  name: string
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  onConnectorCreated: (data?: ConnectorConfigDTO) => void | Promise<void>
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

export interface uploadHostItem {
  hostname: string
}
interface StepConfigureProps {
  closeModal?: () => void
  onSuccess?: () => void
  hosts?: string
}

interface PDCFormInterface {
  delegateType?: string
}
const PdcDetails: React.FC<StepProps<StepConfigureProps> & PdcDetailsProps> = props => {
  const { prevStepData, nextStep } = props
  const { accountId } = props
  const { getString } = useStrings()

  const defaultInitialFormData: PDCFormInterface = {}

  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [hostsJSON, setHostsJSON] = useState([] as uploadHostItem[])
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(props.isEditMode)
  const [manualTypedHosts, setManualTypedHosts] = useState('')

  useEffect(() => {
    setManualTypedHosts(prevStepData?.hosts || '')
  }, [])

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setManualTypedHosts(props.connectorInfo?.spec?.hosts?.map?.((host: any) => host.hostname).join('\n'))
          setupPDCFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as PDCFormInterface)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    const data = { ...formData }
    data.hosts = hostsJSON ? hostsJSON : manualTypedHosts
    nextStep?.({ ...props.connectorInfo, ...prevStepData, ...data } as StepConfigureProps)
  }

  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical spacing="medium" className={css.secondStep}>
      <Text font={{ variation: FontVariation.H3 }} tooltipProps={{ dataTooltipId: 'pdcHostDetails' }}>
        {getString('details')}
      </Text>
      <Formik
        initialValues={{
          ...initialValues,
          ...props.prevStepData
        }}
        formName="pdcDetailsForm"
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <>
            <Container className={css.clusterWrapper}>
              <Layout.Horizontal className={css.hostContainer} spacing="xxlarge">
                <div className={css.manualHostContainer}>
                  <FormInput.TextArea
                    className={css.textInput}
                    name="hosts"
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                      setManualTypedHosts(event.target.value)
                    }}
                    label={
                      <HarnessDocTooltip
                        tooltipId={'pdc-connector-hosts'}
                        labelText={getString('connectors.pdc.hosts')}
                      />
                    }
                  />
                </div>
                <span>{getString('common.orCaps')}</span>
                <UploadJSON
                  setJsonValue={json => {
                    setHostsJSON(json)
                    setManualTypedHosts(json.map(hostItem => hostItem.hostname).join('\n'))
                  }}
                />
              </Layout.Horizontal>
            </Container>
            <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
              <Button
                text={getString('back')}
                icon="chevron-left"
                variation={ButtonVariation.SECONDARY}
                onClick={() => props?.previousStep?.(props?.prevStepData)}
                data-name="pdcBackButton"
              />
              <Button
                type="submit"
                onClick={formikProps.submitForm}
                variation={ButtonVariation.PRIMARY}
                text={getString('continue')}
                rightIcon="chevron-right"
              />
            </Layout.Horizontal>
          </>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default PdcDetails
