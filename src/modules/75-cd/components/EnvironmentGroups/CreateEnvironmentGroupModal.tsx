/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent } from 'react'
import * as Yup from 'yup'
import { defaultTo, omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { parse } from 'yaml'
import {
  Button,
  ButtonVariation,
  Formik,
  Layout,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  Container,
  getErrorInfoFromErrorObject,
  ExpandingSearchInput,
  Checkbox,
  Text
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useGetSchemaYaml } from 'services/pipeline-ng'
import { createEnvironmentGroupPromise, EnvironmentResponseDTO, useGetEnvironmentList } from 'services/cd-ng'

import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { useToaster } from '@common/exports'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'

import css from './EnvironmentGroups.module.scss'

interface CreateEnvironmentGroupModalProps {
  data: EnvironmentResponseDTO
  closeModal: () => void
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `environmentGroup.yaml`,
  entityType: 'EnvironmentGroup',
  width: '100%',
  height: 220,
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

const cleanData = (values: any): any => {
  // const cleanData = (values: EnvironmentResponseDTO): EnvironmentRequestDTO => {
  const newDescription = values.description?.toString().trim()
  const newId = values.identifier?.toString().trim()
  const newName = values.name?.toString().trim()
  return {
    name: newName,
    identifier: newId,
    orgIdentifier: values.orgIdentifier,
    projectIdentifier: values.projectIdentifier,
    description: newDescription,
    tags: defaultTo(values.tags, {}),
    envIdentifiers: values.envIdentifiers
  } as any
}

export default function CreateEnvironmentGroupModal({
  data,
  closeModal
}: CreateEnvironmentGroupModalProps): JSX.Element {
  const { getString } = useStrings()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
    accountId: string
  }>()
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  // const { loading: createLoading, mutate: createEnvironmentGroup } = useCreateEnvironmentGroup({
  //   queryParams: {
  //     accountIdentifier: accountId,
  //     orgIdentifier,
  //     projectIdentifier
  //   }
  // })

  const { showSuccess, showError, clear } = useToaster()
  const onSubmit = async (value: any) => {
    try {
      const values = cleanData(value)
      // if (!values.name) {
      //   showError(getString('fieldRequired', { field: 'Environment' }))
      // } else if (!values.identifier) {
      //   showError(getString('common.validation.fieldIsRequired', { name: 'Identifier' }))
      // } else if (!(isEqual(values.type, 'PreProduction') || isEqual(values.type, 'Production'))) {
      //   showError(getString('cd.typeError'))
      // } else if (isEdit && id !== values.identifier) {
      //   showError(getString('cd.editIdError', { id: id }))
      // } else if (isEdit) {
      //   const response = await updateEnvironment({
      //     ...omit(values, 'accountId', 'deleted'),
      //     orgIdentifier,
      //     projectIdentifier
      //   })
      //   if (response.status === 'SUCCESS') {
      //     clear()
      //     showSuccess(getString('cd.environmentUpdated'))
      //     onCreateOrUpdate(values)
      //   }
      // } else {
      // } else {
      const body = yamlStringify(
        JSON.parse(
          JSON.stringify({
            environmentGroup: { ...values }
          })
        )
      )
      const response = await createEnvironmentGroupPromise({
        body: body as any,
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      })

      if (response.status === 'SUCCESS') {
        clear()
        showSuccess(getString('cd.environmentCreated'))
        closeModal()
      }
    } catch (e) {
      showError(getErrorInfoFromErrorObject(e, true))
    }
  }
  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])
  const formikRef = React.useRef<FormikProps<EnvironmentResponseDTO>>()
  const { data: environmentGroupSchema } = useGetSchemaYaml({
    queryParams: {
      entityType: 'EnvironmentGroup',
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })
  const handleModeSwitch = React.useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = defaultTo(yamlHandler?.getLatestYaml(), /* istanbul ignore next */ '')
        const envSetYamlVisual = parse(yaml).environment as EnvironmentResponseDTO
        if (envSetYamlVisual) {
          formikRef.current?.setValues({
            ...omit(cleanData(envSetYamlVisual) as EnvironmentResponseDTO)
          })
        }
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml, data]
  )
  // if (createLoading) {
  //   return <PageSpinner />
  // }

  const { data: envData } = useGetEnvironmentList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      size: 10,
      searchTerm: ''
    }
  })
  return (
    <>
      <Container className={css.yamlToggleEnv}>
        <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} padding-top="8px">
          <VisualYamlToggle
            selectedView={selectedView}
            onChange={nextMode => {
              handleModeSwitch(nextMode)
            }}
          />
        </Layout.Horizontal>
      </Container>
      <Layout.Vertical>
        <Formik<any>
          initialValues={data as any}
          enableReinitialize={false}
          formName="deployEnvGroup"
          onSubmit={values => {
            onSubmit(values)
          }}
          validationSchema={Yup.object().shape({
            name: NameSchema({ requiredErrorMsg: getString?.('fieldRequired', { field: 'Name' }) }),
            identifier: IdentifierSchema()
          })}
        >
          {formikProps => {
            formikRef.current = formikProps
            const selectedEnvironments = defaultTo(formikProps.values?.envIdentifiers, [])
            return (
              <>
                {selectedView === SelectedView.VISUAL ? (
                  <>
                    <Layout.Horizontal padding={{ top: 'large' }} border={{ top: true }}>
                      <Layout.Vertical
                        width={'50%'}
                        padding={{ right: 'large' }}
                        border={{ right: true }}
                        flex={{ justifyContent: 'space-between', alignItems: 'stretch' }}
                      >
                        <NameIdDescriptionTags
                          formikProps={formikProps}
                          identifierProps={{
                            inputLabel: getString('name'),
                            inputGroupProps: {
                              inputGroup: {
                                inputRef: ref => (inputRef.current = ref)
                              }
                            }
                          }}
                        />

                        <Layout.Horizontal spacing="large" padding={{ top: 'xlarge' }}>
                          <Button
                            variation={ButtonVariation.PRIMARY}
                            type={'submit'}
                            text={getString('submit')}
                            data-id="environment-group-save"
                            onClick={() => {
                              formikProps.submitForm()
                            }}
                          />
                          <Button
                            variation={ButtonVariation.TERTIARY}
                            text={getString('cancel')}
                            onClick={closeModal}
                          />
                        </Layout.Horizontal>
                      </Layout.Vertical>
                      <Layout.Vertical padding={{ left: 'large' }} flex={{ alignItems: 'stretch' }} width={'50%'}>
                        <ExpandingSearchInput
                          alwaysExpanded
                          placeholder={'Search Environments'}
                          autoFocus={false}
                          width={'100%'}
                        />
                        <Layout.Vertical
                          height={300}
                          style={{
                            overflow: 'auto'
                          }}
                        >
                          {envData?.data?.content?.map(item => {
                            const checked = selectedEnvironments.some(
                              (_id: string) => _id === item?.environment?.identifier
                            )
                            return (
                              <Layout.Horizontal
                                width={'100%'}
                                flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                                border={{ top: true, bottom: true }}
                                key={item?.environment?.identifier}
                              >
                                <Layout.Vertical padding={{ left: 'xsmall' }}>
                                  <Checkbox
                                    name="environments"
                                    value={item?.environment?.identifier}
                                    checked={checked}
                                    onChange={(e: FormEvent<HTMLInputElement>) => {
                                      if ((e.target as any).checked && item?.environment?.identifier) {
                                        formikProps.setFieldValue('envIdentifiers', [
                                          ...selectedEnvironments,
                                          item?.environment?.identifier
                                        ])
                                      } else {
                                        formikProps.setFieldValue(
                                          'envIdentifiers',
                                          selectedEnvironments.filter(
                                            (_id: string) => _id !== item?.environment?.identifier
                                          )
                                        )
                                      }
                                    }}
                                  />
                                </Layout.Vertical>
                                <Text
                                  font={{ size: 'normal', weight: 'semi-bold' }}
                                  color={Color.BLACK}
                                  padding="medium"
                                >
                                  {item?.environment?.name}
                                </Text>
                              </Layout.Horizontal>
                            )
                          })}
                        </Layout.Vertical>
                      </Layout.Vertical>
                    </Layout.Horizontal>
                  </>
                ) : (
                  <Container>
                    <YAMLBuilder
                      {...yamlBuilderReadOnlyModeProps}
                      existingJSON={{
                        environmentGroup: {
                          ...omit(formikProps?.values),
                          description: defaultTo(formikProps.values.description, ''),
                          tags: defaultTo(formikProps.values.tags, {}),
                          envIdentifiers: defaultTo(formikProps.values.envIdentifiers, '')
                        }
                      }}
                      schema={environmentGroupSchema?.data}
                      bind={setYamlHandler}
                      showSnippetSection={false}
                    />
                    <Layout.Horizontal padding={{ top: 'large' }}>
                      <Button
                        variation={ButtonVariation.PRIMARY}
                        type="submit"
                        text={getString('save')}
                        onClick={() => {
                          const latestYaml = defaultTo(yamlHandler?.getLatestYaml(), /* istanbul ignore next */ '')
                          onSubmit(parse(latestYaml)?.environment)
                        }}
                      />
                      &nbsp; &nbsp;
                      <Button variation={ButtonVariation.TERTIARY} onClick={closeModal} text={getString('cancel')} />
                    </Layout.Horizontal>
                  </Container>
                )}
              </>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </>
  )
}
