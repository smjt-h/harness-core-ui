/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Button,
  ButtonVariation,
  Color,
  Container,
  Formik,
  Layout,
  MultiSelectOption,
  SelectOption,
  Text
} from '@harness/uicore'
import React, { useCallback, useMemo, useState } from 'react'
import { Form } from 'formik'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type {
  ConfigureAlertConditionsProps,
  NotificationConditions,
  NotificationRule
} from './ConfigureAlertConditions.types'
import {
  createNotificationRule,
  getInitialNotificationRules,
  getUpdatedNotificationRules
} from './ConfigureAlertConditions.utils'
import NotificationRuleRow from './components/NotificationRuleRow/NotificationRuleRow'
import css from './ConfigureAlertConditions.module.scss'

export default function ConfigureAlertConditions({
  prevStepData,
  nextStep,
  previousStep
}: ConfigureAlertConditionsProps): JSX.Element {
  const { projectIdentifier } = useParams<ProjectPathProps>()
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>(
    getInitialNotificationRules(prevStepData)
  )
  const { getString } = useStrings()

  const dataTillCurrentStep = useMemo(() => {
    return {
      ...prevStepData,
      notificationRules
    }
  }, [notificationRules, prevStepData])

  const handleAddNotificationRule = useCallback(() => {
    const newNotificationRules = [...notificationRules, createNotificationRule()]
    setNotificationRules(newNotificationRules)
  }, [notificationRules])

  const handleDeleteNotificationRule = useCallback(
    notificationIdToDelete => {
      const updatedNotificationRules = notificationRules.filter(
        notificationRule => notificationRule.id !== notificationIdToDelete
      )
      setNotificationRules(updatedNotificationRules)
    },
    [notificationRules]
  )

  const handleChangeField = useCallback(
    (
      notificationRule: NotificationRule,
      currentFieldValue: SelectOption | MultiSelectOption[] | string,
      currentField: string,
      nextField?: string,
      nextFieldValue?: SelectOption | MultiSelectOption[] | string
    ) => {
      const updatedNotificationRules = getUpdatedNotificationRules({
        notificationRules,
        notificationRule,
        currentField,
        currentFieldValue,
        nextField,
        nextFieldValue
      })
      setNotificationRules(updatedNotificationRules)
    },
    [notificationRules]
  )

  const rendernotificationRules = (): JSX.Element => {
    const showDeleteNotificationsIcon = notificationRules.length > 1
    return (
      <Container padding={{ top: 'medium' }} className={css.notificationRulesContainer}>
        {notificationRules.length
          ? notificationRules.map(notificationRule => {
              return (
                <NotificationRuleRow
                  key={notificationRule?.id}
                  showDeleteNotificationsIcon={showDeleteNotificationsIcon}
                  notificationRule={notificationRule}
                  handleChangeField={handleChangeField}
                  handleDeleteNotificationRule={handleDeleteNotificationRule}
                />
              )
            })
          : null}
        <RbacButton
          padding={{ bottom: 'small' }}
          icon="plus"
          text={'Add Condition'}
          variation={ButtonVariation.LINK}
          onClick={handleAddNotificationRule}
          data-testid="addCondtion-button"
          margin={{ top: 'small' }}
          permission={{
            permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
            resource: {
              resourceType: ResourceType.MONITOREDSERVICE,
              resourceIdentifier: projectIdentifier
            }
          }}
        />
      </Container>
    )
  }

  return (
    <>
      <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'medium' }}>
        {'Configure the alert conditions for which you want to be notified.'}
      </Text>
      <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'normal' }} padding={{ top: 'large' }}>
        {'Category: Changes and Service Health'}
      </Text>
      <Text font={{ size: 'small' }} padding={{ top: 'small' }}>
        {"Focuses on changes to a service's code, configuration, behaviour, deployment and infrastructure."}
      </Text>
      <Formik<NotificationConditions>
        initialValues={{ ...prevStepData, notificationRules: [createNotificationRule()] }}
        formName="notificationsOverview"
        // Todo: Add validation schema
        onSubmit={() => {
          nextStep?.(dataTillCurrentStep)
        }}
      >
        {() => {
          return (
            <Form>
              <Container className={css.configureConditionsContainer}>
                {rendernotificationRules()}
                <Container flex={{ justifyContent: 'flex-start' }}>
                  <Layout.Horizontal spacing={'small'}>
                    <Button
                      variation={ButtonVariation.TERTIARY}
                      text={getString('back')}
                      onClick={() => previousStep?.(dataTillCurrentStep)}
                    />
                    <Button
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      rightIcon="chevron-right"
                      text={getString('continue')}
                    />
                  </Layout.Horizontal>
                </Container>
              </Container>
            </Form>
          )
        }}
      </Formik>
    </>
  )
}
