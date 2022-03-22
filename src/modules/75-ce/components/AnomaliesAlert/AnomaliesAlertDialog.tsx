/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import {
  Layout,
  StepWizard,
  StepProps,
  DropDown,
  Color,
  FontVariation,
  Text,
  ButtonVariation,
  Button,
  Icon,
  TextInput,
  Formik,
  FormikForm
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { FieldArray, FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { allCloudProvidersList } from '@ce/constants'
import css from './AnomaliesAlertDialog.module.scss'

const modalPropsLight: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 1100,
    position: 'relative',
    minHeight: 600,
    borderLeft: 0,
    paddingBottom: 0,
    overflow: 'hidden'
  }
}

interface Alerts {
  perspective: string
  channelName: string
  channelUrl: string
  alertList: Alerts[]
}

interface NotificationValues {
  alertList: Alerts[]
}

interface StepData {
  name: string | JSX.Element
}

interface AlertsOverviewProps {
  name: string | JSX.Element
  onClose: any
}

interface NotificationChannelProps {
  name: string | JSX.Element
  onClose: any
  formikProps: FormikProps<NotificationValues>
}

const AlertOverview: React.FC<StepProps<StepData> & AlertsOverviewProps> = props => {
  const { getString } = useStrings()

  return (
    <React.Fragment>
      <Icon name="cross" size={16} onClick={() => props.onClose()} className={css.closeBtn} />
      <Layout.Vertical spacing="xxlarge">
        <Text color={Color.BLACK} font={{ variation: FontVariation.H5 }}>
          {props.name}
        </Text>
        <div>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }} margin={{ bottom: 'small' }}>
            {getString('ce.anomalyDetection.notificationAlerts.selectPerspectiveLabel')}
          </Text>
          <DropDown
            placeholder={getString('ce.anomalyDetection.notificationAlerts.selectPerspective')}
            filterable={false}
            addClearBtn={true}
            items={allCloudProvidersList}
            className={css.perspectiveSelection}
            onChange={() => {
              // TODO: Need to be implement
            }}
          />
        </div>
      </Layout.Vertical>
      <Button
        className={css.actionBtn}
        rightIcon="chevron-right"
        variation={ButtonVariation.PRIMARY}
        onClick={() => props.nextStep?.({ name: props.name || '' })}
        text={getString('saveAndContinue')}
      />
    </React.Fragment>
  )
}

const NotificationMethod: React.FC<StepProps<StepData> & NotificationChannelProps> = props => {
  const { getString } = useStrings()

  return (
    <React.Fragment>
      <Icon name="cross" size={16} onClick={() => props.onClose()} className={css.closeBtn} />
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font={{ variation: FontVariation.H5 }}>
          {props.name}
        </Text>
        <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
          {getString('ce.anomalyDetection.notificationAlerts.notificationStepSubtext')}
        </Text>
      </Layout.Vertical>
      <Layout.Vertical spacing="medium" style={{ marginTop: '34px' }}>
        <Text color={Color.BLACK} font={{ variation: FontVariation.H6 }}>
          {getString('ce.anomalyDetection.notificationAlerts.alertChannelHeading')}
        </Text>
        <FieldArray
          name="alertList"
          render={arrayHelpers => {
            const notificationList = props.formikProps?.values?.alertList || []

            return (
              <div>
                {notificationList.map((notificationData, index) => (
                  <Layout.Horizontal key={index} spacing="xlarge" className={css.addAlertChannel}>
                    <DropDown
                      filterable={false}
                      onChange={() => {
                        // TODO: Need to be implement
                      }}
                      addClearBtn={true}
                      value={notificationData.channelName}
                      placeholder={'Select Channel'}
                      items={[
                        { label: 'Select Channel', value: '' },
                        { label: 'Encrypted Text', value: 'ENCRYPTED_TEXT' }
                      ]}
                    />
                    <div className={css.channelUrlInputWrapper}>
                      <DropDown
                        filterable={false}
                        onChange={() => {
                          // TODO: Need to be implement
                        }}
                        addClearBtn={true}
                        value={notificationData.channelUrl}
                        className={css.urlSelection}
                        placeholder={'URL'}
                        items={[
                          { label: 'Select Channel', value: '' },
                          { label: 'Encrypted Text', value: 'ENCRYPTED_TEXT' }
                        ]}
                      />
                      <TextInput placeholder="Enter webhook url or user groups" wrapperClassName={css.urlInput} />
                    </div>
                  </Layout.Horizontal>
                ))}
                <Button
                  text={getString('ce.anomalyDetection.notificationAlerts.addChannelBtn')}
                  icon="plus"
                  onClick={() => arrayHelpers.push({ channelName: '', channelUrl: '' })}
                  variation={ButtonVariation.LINK}
                  style={{ width: '127px', paddingLeft: '0' }}
                />
              </div>
            )
          }}
        />
      </Layout.Vertical>
      <Layout.Horizontal className={css.actionBtn} spacing="medium">
        <Button
          onClick={() => props.previousStep?.({ name: props.name || '' })}
          text="Back"
          icon="chevron-left"
          variation={ButtonVariation.TERTIARY}
        />
        <Button
          type="submit"
          variation={ButtonVariation.PRIMARY}
          rightIcon="chevron-right"
          onClick={() => props.nextStep?.({ name: props.name || '' })}
          text={getString('saveAndContinue')}
        />
      </Layout.Horizontal>
    </React.Fragment>
  )
}

const useAnomaliesAlertDialog = () => {
  const { getString } = useStrings()

  const handleSubmit = () => {
    // TODO: Need to implement the values handling
  }

  const [createAnomaliesAlertModal, hideAnomaliesAlertModal] = useModalHook(
    () => (
      <Dialog onClose={hideAnomaliesAlertModal} {...modalPropsLight} canOutsideClickClose={true}>
        <Formik
          onSubmit={handleSubmit}
          formName={'createNotificationAlert'}
          initialValues={{
            perspective: '',
            channelName: '',
            channelUrl: '',
            alertList: []
          }}
          render={formikProps => {
            return (
              <FormikForm>
                <StepWizard
                  icon="right-bar-notification"
                  iconProps={{
                    size: 34,
                    color: 'white'
                  }}
                  className={css.stepWizard}
                  title={getString('ce.anomalyDetection.notificationAlerts.heading')}
                >
                  <AlertOverview
                    name={getString('ce.anomalyDetection.notificationAlerts.overviewStep')}
                    onClose={hideAnomaliesAlertModal}
                  />
                  <NotificationMethod
                    name={getString('ce.anomalyDetection.notificationAlerts.notificationStep')}
                    onClose={hideAnomaliesAlertModal}
                    formikProps={formikProps}
                  />
                </StepWizard>
              </FormikForm>
            )
          }}
        />
      </Dialog>
    ),
    []
  )
  return {
    openAnomaliesAlertModal: createAnomaliesAlertModal
  }
}

export default useAnomaliesAlertDialog
