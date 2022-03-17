/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Formik,
  FormInput,
  Dialog,
  Layout,
  SelectOption,
  DataTooltipInterface
} from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import * as Yup from 'yup'
import { defaultTo, isEmpty, isNil, noop, omit } from 'lodash-es'
import { useParams } from 'react-router-dom'

import type { FormikProps } from 'formik'

import { EnvironmentRequestDTO, EnvironmentYaml, useGetEnvironmentList } from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import { getEnvironmentRefSchema, getEnvironmentSchema } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import { DeployEnvData, DeployEnvironmentState, isEditEnvironment, NewEditEnvironmentModal } from './DeployEnvStep'
import css from './DeployEnvStep.module.scss'

export interface SimpleEnvironmentProps {
  initialValues: DeployEnvData
  onUpdate?: (data: DeployEnvData) => void
  stepViewType?: StepViewType
  readonly: boolean
  inputSetData?: {
    template?: DeployEnvData
    path?: string
    readonly?: boolean
  }
  environmentLabel?: string
  clearButton?: boolean
  tooltipProp?: DataTooltipInterface | undefined
  serviceNotRequired?: boolean
  showEditHide?: boolean
}

export const SimpleEnvironmentWidget: React.FC<SimpleEnvironmentProps> = ({
  initialValues,
  onUpdate,
  readonly,
  environmentLabel,
  clearButton,
  tooltipProp,
  serviceNotRequired,
  showEditHide
}): JSX.Element => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()

  const { showError } = useToaster()
  const {
    data: environmentsResponse,
    loading,
    error
  } = useGetEnvironmentList({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const [environments, setEnvironments] = React.useState<EnvironmentYaml[]>()
  const [selectOptions, setSelectOptions] = React.useState<SelectOption[]>()

  const [state, setState] = React.useState<DeployEnvironmentState>({
    isEdit: false,
    isEnvironment: false,
    data: { name: '', identifier: '' }
  })

  const updateEnvironmentsList = (value: EnvironmentRequestDTO) => {
    formikRef.current?.setValues({ environmentVal: value.identifier, ...(state.isEnvironment && { environment: {} }) })
    if (!isNil(environments)) {
      const newEnvironment = {
        description: value.description,
        identifier: defaultTo(value.identifier, ''),
        name: value.name || '',
        tags: value.tags,
        type: value.type
      }
      const newEnvironmentsList = [...environments]
      const existingIndex = newEnvironmentsList.findIndex(item => item.identifier === value.identifier)
      if (existingIndex >= 0) {
        newEnvironmentsList.splice(existingIndex, 1, newEnvironment)
      } else {
        newEnvironmentsList.unshift(newEnvironment)
      }
      setEnvironments(newEnvironmentsList)
    }
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={onClose}
        title={state.isEdit ? getString('editEnvironment') : getString('newEnvironment')}
      >
        <NewEditEnvironmentModal
          data={state.data || { name: '', identifier: '' }}
          isEnvironment={state.isEnvironment}
          isEdit={state.isEdit}
          onCreateOrUpdate={value => {
            updateEnvironmentsList(value)
            onClose.call(null)
          }}
          closeModal={onClose}
        />
      </Dialog>
    ),
    [state]
  )

  const onClose = React.useCallback(() => {
    setState({ isEdit: false, isEnvironment: false })
    hideModal()
  }, [hideModal])

  React.useEffect(() => {
    if (!isNil(selectOptions) && initialValues.environmentVal) {
      const doesExist = selectOptions.filter(env => env.value === initialValues.environmentVal).length > 0
      if (!doesExist) {
        if (!readonly) {
          formikRef.current?.setFieldValue('environmentVal', '')
        } else {
          const options = [...selectOptions]
          options.push({
            label: initialValues.environmentVal,
            value: initialValues.environmentVal
          })
          setSelectOptions(options)
        }
      }
    }
  }, [selectOptions])

  React.useEffect(() => {
    if (!isNil(environments)) {
      setSelectOptions(
        environments.map(environment => {
          return { label: environment.name, value: environment.identifier }
        })
      )
    }
  }, [environments])

  React.useEffect(() => {
    if (!loading) {
      const envList: EnvironmentYaml[] = []
      if (environmentsResponse?.data?.content?.length) {
        environmentsResponse.data.content.forEach(env => {
          envList.push({
            description: env.environment?.description,
            identifier: env.environment?.identifier || '',
            name: env.environment?.name || '',
            tags: env.environment?.tags,
            type: env.environment?.type || 'PreProduction'
          })
        })
      }
      if (initialValues.environment) {
        const identifier = initialValues.environment.identifier
        const isExist = envList.filter(env => env.identifier === identifier).length > 0
        if (initialValues.environment && identifier && !isExist) {
          envList.push({
            description: initialValues.environment.description,
            identifier: initialValues.environment.identifier || '',
            name: initialValues.environment.name || '',
            tags: initialValues.environment.tags,
            type: initialValues.environment.type || 'PreProduction'
          })
        }
      }
      setEnvironments(envList)
    }
  }, [loading, environmentsResponse, environmentsResponse?.data?.content?.length])

  if (error?.message) {
    showError(error.message, undefined, 'cd.env.list.error')
  }

  const [canEdit] = usePermission({
    resource: {
      resourceType: ResourceType.ENVIRONMENT,
      resourceIdentifier: environments ? (environments[0]?.identifier as string) : ''
    },
    permissions: [PermissionIdentifier.EDIT_ENVIRONMENT],
    options: {
      skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
    }
  })

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.ENVIRONMENT
    },
    permissions: [PermissionIdentifier.EDIT_ENVIRONMENT]
  })

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [])

  const environmentVal = initialValues?.environment?.identifier || initialValues?.environmentVal

  return (
    <>
      <Formik<DeployEnvData>
        formName="deployEnvStepForm"
        onSubmit={noop}
        validate={values => {
          if (!isEmpty(values.environment)) {
            onUpdate?.({ ...omit(values, 'environmentVal') })
          } else {
            onUpdate?.({ ...omit(values, 'environment'), environmentVal: values.environmentVal })
          }
        }}
        initialValues={{
          ...initialValues,
          ...{ environmentVal }
        }}
        validationSchema={Yup.object().shape(
          serviceNotRequired
            ? {
                environmentVal: getEnvironmentSchema()
              }
            : {
                environmentVal: getEnvironmentRefSchema(getString)
              }
        )}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
          formikRef.current = formik
          const { values, setFieldValue } = formik
          return (
            <Layout.Horizontal
              className={css.formRow}
              spacing="medium"
              flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
            >
              <FormInput.Select
                label={
                  environmentLabel
                    ? environmentLabel
                    : getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment')
                }
                tooltipProps={tooltipProp}
                name="environmentVal"
                key={formik?.values?.environmentVal}
                disabled={readonly || loading}
                placeholder={
                  loading ? getString('loading') : getString('cd.pipelineSteps.environmentTab.selectEnvironment')
                }
                onChange={val => {
                  if (values.environment?.identifier && (val as SelectOption).value !== values.environment.identifier) {
                    setEnvironments(environments?.filter(env => env.identifier !== values.environment?.identifier))
                    setFieldValue('environment', undefined)
                  }
                }}
                addClearButton={clearButton}
                selectProps={{
                  disabled: loading,
                  onQueryChange: val => {
                    if (values.environment?.identifier && (val as any).value !== values.environment.identifier) {
                      setEnvironments(environments?.filter(env => env.identifier !== values.environment?.identifier))
                      setFieldValue('environment', undefined)
                    }
                  }
                }}
                items={selectOptions || []}
              />
              {showEditHide && (
                <Button
                  size={ButtonSize.SMALL}
                  variation={ButtonVariation.LINK}
                  disabled={readonly || (isEditEnvironment(values) ? !canEdit : !canCreate)}
                  onClick={() => {
                    const isEdit = isEditEnvironment(values)
                    if (isEdit) {
                      if (values.environment?.identifier) {
                        setState({
                          isEdit,
                          formik,
                          isEnvironment: true,
                          data: values.environment
                        })
                      } else {
                        setState({
                          isEdit,
                          formik,
                          isEnvironment: false,
                          data: environments?.find(env => env.identifier === values.environmentVal)
                        })
                      }
                    } else {
                      setState({
                        isEdit: false,
                        isEnvironment: false,
                        formik
                      })
                    }
                    showModal()
                  }}
                  text={
                    isEditEnvironment(values)
                      ? getString('editEnvironment')
                      : getString('cd.pipelineSteps.environmentTab.plusNewEnvironment')
                  }
                  id={isEditEnvironment(values) ? 'edit-environment' : 'add-new-environment'}
                />
              )}
            </Layout.Horizontal>
          )
        }}
      </Formik>
    </>
  )
}
