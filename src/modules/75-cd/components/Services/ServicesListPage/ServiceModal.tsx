/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { omit } from 'lodash-es'
import * as Yup from 'yup'
import {
  Button,
  ButtonVariation,
  Formik,
  Layout,
  PageSpinner,
  Container,
  FormikForm,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import type { FormikProps } from 'formik'
import { NameIdDescriptionTags } from '@common/components'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useGetSchemaYaml } from 'services/pipeline-ng'
import { ServiceRequestDTO, ServiceResponseDTO, useUpsertServiceV2 } from 'services/cd-ng'
import { useToaster } from '@common/exports'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { useStrings } from 'framework/strings'
import css from './ServicesListPage.module.scss'

export interface NewEditServiceModalPropsYaml {
  isEdit: boolean
  isService: boolean
  data: ServiceResponseDTO
  serviceIdentifier?: string
  onCreateOrUpdate(data: ServiceRequestDTO): void
  closeModal?: () => void
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `service.yaml`,
  entityType: 'Service',
  width: '100%',
  height: 194,
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

export const NewEditServiceModalYaml: React.FC<NewEditServiceModalPropsYaml> = ({
  isEdit,
  data,
  isService,
  onCreateOrUpdate,
  closeModal
}): JSX.Element => {
  const { getString } = useStrings()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
    accountId: string
  }>()
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const { loading: updateLoading, mutate: updateService } = useUpsertServiceV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])
  const { showSuccess, showError, clear } = useToaster()

  const onSubmit = React.useCallback(
    async (values: ServiceRequestDTO) => {
      try {
        if (!values.name) {
          showError(getString('fieldRequired', { field: 'Service' }))
        } else if (!values.identifier) {
          showError(getString('common.validation.fieldIsRequired', { name: 'Identifier' }))
        } else if (isEdit && id !== values.identifier) {
          showError(getString('cd.editIdError', { id: id }))
        } else if (isEdit && !isService) {
          const response = await updateService({
            ...omit(values, 'accountId', 'deleted'),
            orgIdentifier,
            projectIdentifier
          })
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('cd.serviceUpdated'))
            onCreateOrUpdate(values)
          }
        } else {
          const response = await updateService({
            ...omit(values, 'accountId', 'deleted'),
            orgIdentifier,
            projectIdentifier
          })
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('cd.serviceCreated'))
            onCreateOrUpdate(values)
          }
        }
      } catch (e) {
        showError(e?.data?.message || e?.message || getString('commonError'))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onCreateOrUpdate, orgIdentifier, projectIdentifier, isEdit, isService]
  )

  const formikRef = React.useRef<FormikProps<ServiceResponseDTO>>()
  const id = data.identifier
  const { data: serviceSchema } = useGetSchemaYaml({
    queryParams: {
      entityType: 'Service',
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })
  const handleModeSwitch = React.useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
        const serviceSetYamlVisual = parse(yaml).serviceInputSet as ServiceResponseDTO
        if (serviceSetYamlVisual) {
          data.name = serviceSetYamlVisual.name || ''
          data.identifier = serviceSetYamlVisual.identifier || ''
          data.description = serviceSetYamlVisual.description || ''
          data.tags = serviceSetYamlVisual.tags || {}

          formikRef.current?.setValues({
            ...omit(data)
          })
        }
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml, data]
  )
  if (updateLoading) {
    return <PageSpinner />
  }

  return (
    <>
      <Container className={css.yamlToggle}>
        <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} padding-top="8px">
          <VisualYamlToggle
            selectedView={selectedView}
            onChange={nextMode => {
              handleModeSwitch(nextMode)
            }}
          />
        </Layout.Horizontal>
      </Container>
      <Formik<ServiceResponseDTO>
        initialValues={data as ServiceResponseDTO}
        formName="addService"
        enableReinitialize={false}
        onSubmit={values => {
          onSubmit(values)
        }}
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString?.('fieldRequired', { field: 'Service' }) }),
          identifier: IdentifierSchema()
        })}
      >
        {formikProps => {
          formikRef.current = formikProps
          return (
            <>
              {selectedView === SelectedView.VISUAL ? (
                <FormikForm>
                  <NameIdDescriptionTags
                    formikProps={formikProps}
                    identifierProps={{
                      inputLabel: getString('name'),
                      inputGroupProps: {
                        inputGroup: {
                          inputRef: ref => (inputRef.current = ref)
                        }
                      },
                      isIdentifierEditable: !isEdit
                    }}
                  />
                  <Layout.Horizontal className={css.editServiceSaveCancel}>
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      type={'submit'}
                      text={getString('save')}
                      data-id="service-save"
                    />
                    &nbsp;
                    <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={closeModal} />
                  </Layout.Horizontal>
                </FormikForm>
              ) : (
                <Container className={css.editor}>
                  <YAMLBuilder
                    {...yamlBuilderReadOnlyModeProps}
                    existingJSON={{
                      serviceInputSet: {
                        ...omit(formikProps?.values),
                        description: formikProps.values.description || '',
                        tags: formikProps.values.tags || {}
                      }
                    }}
                    bind={setYamlHandler}
                    schema={serviceSchema?.data}
                    showSnippetSection={false}
                  />
                  <Layout.Horizontal spacing={'xsmall'} padding={{ top: 'large' }}>
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      type="submit"
                      text={getString('save')}
                      onClick={() => {
                        const latestYaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
                        onSubmit(parse(latestYaml)?.serviceInputSet)
                      }}
                    />
                    <Button variation={ButtonVariation.TERTIARY} onClick={closeModal} text={getString('cancel')} />
                  </Layout.Horizontal>
                </Container>
              )}
            </>
          )
        }}
      </Formik>
    </>
  )
}
