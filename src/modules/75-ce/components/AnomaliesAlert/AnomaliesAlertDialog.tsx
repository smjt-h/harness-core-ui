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
  Color,
  FontVariation,
  Text,
  ButtonVariation,
  Button,
  Icon,
  Formik,
  FormikForm,
  FormInput,
  SelectOption,
  useToaster,
  getErrorInfoFromErrorObject
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { FieldArray, FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { QlceView, useFetchPerspectiveListQuery } from 'services/ce/services'
import { notificationChannelsList } from '@ce/constants'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useCreateNotificationSetting, useUpdateNotificationSetting } from 'services/ce'
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
  items: any
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
          <FormInput.Select
            items={props.items}
            className={css.perspectiveSelection}
            name={'perspective'}
            label={getString('ce.anomalyDetection.notificationAlerts.selectPerspectiveLabel')}
            placeholder={getString('ce.anomalyDetection.notificationAlerts.selectPerspective')}
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
      <Layout.Vertical spacing="medium" className={css.addChannelWrapper}>
        <Text color={Color.BLACK} font={{ variation: FontVariation.H6 }}>
          {getString('ce.anomalyDetection.notificationAlerts.alertChannelHeading')}
        </Text>
        <FieldArray
          name="alertList"
          render={arrayHelpers => {
            const notificationList = props.formikProps?.values?.alertList || []

            return (
              <div>
                {notificationList.map((_, index) => (
                  <Layout.Horizontal key={index} spacing="xlarge" className={css.addAlertChannel}>
                    <FormInput.Select
                      items={notificationChannelsList as SelectOption[]}
                      key={`channelName_${index}`}
                      name={`alertList.${index}.channelName`}
                      className={css.channelSelection}
                      placeholder={getString('ce.anomalyDetection.notificationAlerts.selectChannelPlaceholder')}
                    />
                    <FormInput.Text
                      name={`alertList.${index}.channelUrl`}
                      key={`channelUrl_${index}`}
                      placeholder={getString('ce.anomalyDetection.notificationAlerts.urlInputPlaceholder')}
                      className={css.urlInput}
                    />
                  </Layout.Horizontal>
                ))}
                <Button
                  text={getString('ce.anomalyDetection.notificationAlerts.addChannelBtn')}
                  icon="plus"
                  onClick={() => arrayHelpers.push({ channelName: '', channelUrl: '' })}
                  variation={ButtonVariation.LINK}
                  className={css.addChannelBtn}
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

interface AlertDialogProps {
  hideAnomaliesAlertModal: any
  handleSubmit: any
  notificationData: any
}

export const AnomalyAlertDialog: React.FC<AlertDialogProps> = ({
  hideAnomaliesAlertModal,
  handleSubmit,
  notificationData
}) => {
  const { getString } = useStrings()

  const [{ data: perspectiveData }] = useFetchPerspectiveListQuery()

  const perspectiveList = (perspectiveData?.perspectives?.customerViews || []) as QlceView[]

  const items = perspectiveList.map(pName => ({
    label: pName.name as string,
    value: pName.id as string
  }))

  const channelsData =
    notificationData?.channels.map((item: any) => {
      return {
        channelName: item.notificationChannelType,
        channelUrl: item.channelUrls[0]
      }
    }) || []

  return (
    <Dialog onClose={hideAnomaliesAlertModal} {...modalPropsLight} canOutsideClickClose={true}>
      <Formik
        onSubmit={data => handleSubmit(data)}
        formName={'createNotificationAlert'}
        initialValues={{
          perspective: notificationData?.perspectiveId || '',
          channelName: '',
          channelUrl: '',
          alertList: channelsData || []
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
                  items={items}
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
  )
}

const mapping = {
  SLACK: 'slackWebHookUrl',
  EMAIL: 'emails',
  MICROSOFT_TEAMS: 'microsoftTeamsUrl'
}

interface AnomalyAlertDialogProps {
  setRefetchingState: React.Dispatch<React.SetStateAction<boolean>>
  selectedAlert: any
}

const useAnomaliesAlertDialog = (props: AnomalyAlertDialogProps) => {
  const { accountId } = useParams<AccountPathProps>()
  const { showError, showSuccess } = useToaster()
  const { getString } = useStrings()

  const { mutate: createNotificationAlert } = useCreateNotificationSetting({
    queryParams: {
      accountIdentifier: accountId,
      perspectiveId: ''
    }
  })

  const { mutate: updateNotificationAlert } = useUpdateNotificationSetting({
    queryParams: {
      accountIdentifier: accountId,
      perspectiveId: ''
    }
  })

  const handleSubmit = async (data: any) => {
    const payload = data.alertList.map((item: any) => {
      const channel = item.channelName

      if (channel === 'EMAIL') {
        return {
          type: channel,
          [mapping[channel as keyof typeof mapping]]: [item.channelUrl]
        }
      }
      return {
        type: channel,
        [mapping[channel as keyof typeof mapping]]: item.channelUrl
      }
    })

    const queryParams = {
      perspectiveId: data.perspective,
      accountIdentifier: accountId
    }

    try {
      let response
      if (props.selectedAlert && props.selectedAlert.channels.length) {
        response = await updateNotificationAlert({ channels: payload }, { queryParams })
      } else {
        response = await createNotificationAlert({ channels: payload }, { queryParams })
      }

      hideAnomaliesAlertModal()
      props.setRefetchingState(true)
      if (response) {
        if (props.selectedAlert && props.selectedAlert.channels.length) {
          showSuccess(getString('ce.anomalyDetection.notificationAlerts.updateAlertSuccessMsg'))
        } else {
          showSuccess(getString('ce.anomalyDetection.notificationAlerts.addAlertSuccessMsg'))
        }
      }
    } catch (error) {
      showError(getErrorInfoFromErrorObject(error))
    }
  }

  const [createAnomaliesAlertModal, hideAnomaliesAlertModal] = useModalHook(
    () => (
      <AnomalyAlertDialog
        hideAnomaliesAlertModal={hideAnomaliesAlertModal}
        handleSubmit={handleSubmit}
        notificationData={props.selectedAlert}
      />
    ),
    [props.selectedAlert]
  )
  return {
    openAnomaliesAlertModal: createAnomaliesAlertModal
  }
}

export default useAnomaliesAlertDialog
