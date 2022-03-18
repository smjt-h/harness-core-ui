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

import { ServiceConfig, ServiceRequestDTO, ServiceResponseDTO, ServiceYaml, useGetServiceList } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'

import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import { getServiceRefSchema, getServiceSchema } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isEditService, NewEditServiceModal } from './DeployServiceStep'
import css from './DeployServiceStep.module.scss'

export interface SimpleServiceData extends Omit<ServiceConfig, 'serviceRef'> {
  serviceVal?: string
}
export interface SimpleServiceState {
  isEdit: boolean
  data?: ServiceResponseDTO
  isService: boolean
  formik?: FormikProps<SimpleServiceData>
}

export interface SimpleServiceProps {
  initialValues: SimpleServiceData
  onUpdate?: (data: SimpleServiceData) => void
  stepViewType?: StepViewType
  readonly: boolean
  inputSetData?: {
    template?: SimpleServiceData
    path?: string
    readonly?: boolean
  }
  serviceLabel?: string
  clearButton?: boolean
  tooltipProp?: DataTooltipInterface | undefined
  serviceNotRequired?: boolean
  showHideEdit?: boolean
}

export const SimpleServiceWidget: React.FC<SimpleServiceProps> = ({
  initialValues,
  onUpdate,
  readonly,
  serviceLabel,
  clearButton,
  tooltipProp,
  serviceNotRequired,
  showHideEdit
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
    data: serviceResponse,
    error,
    loading
  } = useGetServiceList({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const [services, setService] = React.useState<ServiceYaml[]>()
  const [selectOptions, setSelectOptions] = React.useState<SelectOption[]>()

  const [state, setState] = React.useState<SimpleServiceState>({ isEdit: false, isService: false })

  const updateServicesList = (value: ServiceRequestDTO) => {
    formikRef.current?.setValues({ serviceVal: value.identifier, ...(state.isService && { service: {} }) })
    if (!isNil(services)) {
      const newService = {
        description: value.description,
        identifier: defaultTo(value.identifier, ''),
        name: value.name || '',
        tags: value.tags
      }
      const newServicesList = [...services]
      const existingIndex = newServicesList.findIndex(item => item.identifier === value.identifier)
      if (existingIndex >= 0) {
        newServicesList.splice(existingIndex, 1, newService)
      } else {
        newServicesList.unshift(newService)
      }
      setService(newServicesList)
    }
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={onClose}
        title={state.isEdit ? getString('editService') : getString('newService')}
      >
        <NewEditServiceModal
          data={state.data || { name: '', identifier: '' }}
          isEdit={state.isEdit}
          isService={state.isService}
          onCreateOrUpdate={value => {
            updateServicesList(value)
            onClose.call(null)
          }}
          closeModal={onClose}
        />
      </Dialog>
    ),
    [state]
  )

  const onClose = React.useCallback(() => {
    setState({ isEdit: false, isService: false })
    hideModal()
  }, [hideModal])

  React.useEffect(() => {
    if (!isNil(selectOptions) && initialValues.serviceVal) {
      const doesExist = selectOptions.filter(service => service.value === initialValues.serviceVal).length > 0
      if (!doesExist) {
        if (!readonly) {
          formikRef.current?.setFieldValue('serviceVal', '')
        } else {
          const options = [...selectOptions]
          options.push({
            label: initialValues.serviceVal,
            value: initialValues.serviceVal
          })
          setSelectOptions(options)
        }
      }
    }
  }, [selectOptions])

  React.useEffect(() => {
    if (!isNil(services)) {
      setSelectOptions(
        services.map(service => {
          return { label: service.name, value: service.identifier }
        })
      )
    }
  }, [services])

  React.useEffect(() => {
    if (!loading) {
      const serviceList: ServiceYaml[] = []
      if (serviceResponse?.data?.content?.length) {
        serviceResponse.data.content.forEach(service => {
          serviceList.push({
            description: service.service?.description,
            identifier: service.service?.identifier || '',
            name: service.service?.name || '',
            tags: service.service?.tags
          })
        })
      }
      if (initialValues.service) {
        const identifier = initialValues.service.identifier
        const isExist = serviceList.filter(service => service.identifier === identifier).length > 0
        if (initialValues.service && identifier && !isExist) {
          serviceList.push({
            description: initialValues.service?.description,
            identifier: initialValues.service?.identifier || '',
            name: initialValues.service?.name || '',
            tags: initialValues.service?.tags
          })
        }
      }
      setService(serviceList)
    }
  }, [loading, serviceResponse, serviceResponse?.data?.content?.length])

  if (error?.message) {
    showError(error.message, undefined, 'cd.svc.list.error')
  }

  const [canEdit] = usePermission({
    resource: {
      resourceType: ResourceType.SERVICE,
      resourceIdentifier: services ? (services[0]?.identifier as string) : ''
    },
    permissions: [PermissionIdentifier.EDIT_SERVICE],
    options: {
      skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
    }
  })

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.SERVICE
    },
    permissions: [PermissionIdentifier.EDIT_SERVICE]
  })
  // TODO: Revisit this part if needed
  // Don't need this since it's not currently in the pipeline page but in gitops
  // const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  // TODO: Revisit this part if needed
  // Don't need this since it's not currently in the pipeline page but in gitops
  // React.useEffect(() => {
  //   subscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
  //   return () => unSubscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  const serviceVal = initialValues?.service?.identifier || initialValues?.serviceVal

  return (
    <>
      <Formik<SimpleServiceData>
        formName="deployServiceStepForm"
        onSubmit={noop}
        validate={values => {
          if (!isEmpty(values.service)) {
            onUpdate?.({ ...omit(values, 'serviceVal') })
          } else {
            onUpdate?.({ ...omit(values, 'service'), serviceVal: values.serviceVal })
          }
        }}
        initialValues={{
          ...initialValues,
          ...{ serviceVal }
        }}
        validationSchema={Yup.object().shape(
          serviceNotRequired
            ? { serviceVal: getServiceSchema() }
            : {
                serviceVal: getServiceRefSchema(getString)
              }
        )}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.SERVICE }))
          formikRef.current = formik
          const { values, setFieldValue } = formik
          return (
            <Layout.Horizontal
              className={css.formRow}
              spacing="medium"
              flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
            >
              <FormInput.Select
                key={formik?.values?.serviceVal}
                tooltipProps={tooltipProp}
                label={serviceLabel ? serviceLabel : getString('cd.pipelineSteps.serviceTab.specifyYourService')}
                name="serviceVal"
                disabled={readonly || loading}
                placeholder={loading ? getString('loading') : getString('cd.pipelineSteps.serviceTab.selectService')}
                onChange={val => {
                  if (values.service?.identifier && (val as SelectOption).value !== values.service.identifier) {
                    setService(services?.filter(service => service.identifier !== values.service?.identifier))
                    setFieldValue('service', undefined)
                  }
                }}
                addClearButton={clearButton}
                selectProps={{ disabled: loading }}
                items={selectOptions || []}
              />
              {showHideEdit && (
                <Button
                  size={ButtonSize.SMALL}
                  variation={ButtonVariation.LINK}
                  disabled={readonly || (isEditService(values) ? !canEdit : !canCreate)}
                  onClick={() => {
                    const isEdit = isEditService(values)
                    if (isEdit) {
                      if (values.service?.identifier) {
                        setState({
                          isEdit,
                          formik,
                          isService: true,
                          data: values.service
                        })
                      } else {
                        setState({
                          isEdit,
                          formik,
                          isService: false,
                          data: services?.find(service => service.identifier === values.serviceVal)
                        })
                      }
                    } else {
                      setState({
                        isEdit: false,
                        formik,
                        isService: false
                      })
                    }
                    showModal()
                  }}
                  text={
                    isEditService(values)
                      ? getString('editService')
                      : getString('cd.pipelineSteps.serviceTab.plusNewService')
                  }
                  id={isEditService(initialValues) ? 'edit-service' : 'add-new-service'}
                />
              )}
            </Layout.Horizontal>
          )
        }}
      </Formik>
    </>
  )
}
