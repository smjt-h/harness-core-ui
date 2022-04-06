/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { StepWizard, Formik, FormikForm, useToaster, getErrorInfoFromErrorObject, Color } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { QlceView, useFetchPerspectiveListQuery } from 'services/ce/services'
import { channelNameUrlMapping, channels } from '@ce/constants'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  CCMNotificationChannel,
  CCMPerspectiveNotificationChannelsDTO,
  useCreateNotificationSetting,
  useUpdateNotificationSetting
} from 'services/ce'
import PerspectiveSelection from './PerspectiveSelection'
import NotificationMethod from './NotificationMethod'
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

interface AlertDialogProps {
  hideAnomaliesAlertModal: () => void
  handleSubmit: (data: FormValues) => void
  notificationData: CCMPerspectiveNotificationChannelsDTO
}
interface AnomalyAlertDialogProps {
  setRefetchingState: React.Dispatch<React.SetStateAction<boolean>>
  selectedAlert: CCMPerspectiveNotificationChannelsDTO
}

interface AlertsData {
  channelName?: channels
  channelUrl?: string | string[]
}
interface FormValues {
  perspective: string
  alertList: AlertsData[]
}

export const AnomalyAlertDialog: React.FC<AlertDialogProps> = ({
  hideAnomaliesAlertModal,
  handleSubmit,
  notificationData
}) => {
  const { getString } = useStrings()

  const [{ data: perspectiveData }] = useFetchPerspectiveListQuery()

  /* istanbul ignore next */
  const perspectiveList = (perspectiveData?.perspectives?.customerViews || []) as QlceView[]

  const items = perspectiveList.map(pName => ({
    label: pName.name as string,
    value: pName.id as string
  }))

  const channelsData =
    notificationData?.channels?.map((item: CCMNotificationChannel) => {
      return {
        channelName: item.notificationChannelType,
        channelUrl: item.channelUrls?.[0]
      }
    }) || /* istanbul ignore next */ []

  return (
    <Dialog onClose={hideAnomaliesAlertModal} {...modalPropsLight} canOutsideClickClose={true}>
      <Formik
        onSubmit={data => handleSubmit(data)}
        formName={'createNotificationAlert'}
        initialValues={{
          perspective: notificationData?.perspectiveId || '',
          channelName: '',
          channelUrl: '',
          alertList: channelsData || /* istanbul ignore next */ []
        }}
        render={formikProps => {
          return (
            <FormikForm>
              <StepWizard
                icon="right-bar-notification"
                iconProps={{
                  size: 34,
                  color: Color.WHITE
                }}
                className={css.stepWizard}
                title={getString('ce.anomalyDetection.notificationAlerts.heading')}
              >
                <PerspectiveSelection
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

  /* istanbul ignore next */
  const handleSubmit = async (data: FormValues) => {
    const payload = data.alertList.map((item: AlertsData) => {
      const channel = item.channelName

      if (channel === 'EMAIL' && typeof item.channelUrl === 'string') {
        const emailList = item.channelUrl.split(',')
        return {
          type: channel,
          [channelNameUrlMapping[channel as keyof typeof channelNameUrlMapping]]: emailList
        }
      }
      return {
        type: channel,
        [channelNameUrlMapping[channel as keyof typeof channelNameUrlMapping]]: item.channelUrl
      }
    })

    const queryParams = {
      perspectiveId: data.perspective,
      accountIdentifier: accountId
    }

    try {
      let response
      if (props.selectedAlert && props.selectedAlert.channels?.length) {
        response = await updateNotificationAlert({ channels: payload as CCMNotificationChannel[] }, { queryParams })
      } else {
        response = await createNotificationAlert({ channels: payload as CCMNotificationChannel[] }, { queryParams })
      }

      hideAnomaliesAlertModal()
      props.setRefetchingState(true)
      if (response) {
        if (props.selectedAlert && props.selectedAlert.channels?.length) {
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
