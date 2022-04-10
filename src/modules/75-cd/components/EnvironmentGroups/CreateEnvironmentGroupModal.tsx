/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { defaultTo, isEmpty } from 'lodash-es'
import { parse } from 'yaml'
import { Spinner } from '@blueprintjs/core'

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
  Text,
  Heading
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  createEnvironmentGroupPromise,
  EnvironmentGroupResponseDTO,
  EnvironmentResponse,
  getEnvironmentListPromise,
  useGetYamlSchema
} from 'services/cd-ng'

import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { useToaster } from '@common/exports'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

import { useInfiniteScroll } from '@templates-library/components/TemplateActivityLog/InfiniteScroll'

import { EnvironmentGroupDetailsTab } from './EnvironmentGroupDetails/EnvironmentGroupDetails'
import { cleanData } from './utils'

import EmptyEnvironmentGroup from './images/EmptyEnvironmentGroup.svg'

import { EnvironmentGroupName } from './EnvironmentGroupsListColumns'

interface CreateEnvironmentGroupModalProps {
  closeModal: () => void
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `environmentGroup.yaml`,
  entityType: 'EnvironmentGroup',
  width: '100%',
  height: 250,
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

export default function CreateEnvironmentGroupModal({ closeModal }: CreateEnvironmentGroupModalProps): JSX.Element {
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const formikRef = useRef<FormikProps<EnvironmentGroupResponseDTO>>()
  const loadMoreRef = useRef(null)
  const pageSize = useRef(20)

  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const [selectedView, setSelectedView] = useState<SelectedView>(SelectedView.VISUAL)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [createLoading, setCreateLoading] = useState(false)

  const { getString } = useStrings()
  const history = useHistory()
  const { showSuccess, showError, clear } = useToaster()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const onSubmit = async (value: EnvironmentGroupResponseDTO) => {
    setCreateLoading(true)
    try {
      const values = cleanData(value)
      const body = yamlStringify(
        JSON.parse(
          JSON.stringify({
            environmentGroup: { ...values }
          })
        )
      )
      const response = await createEnvironmentGroupPromise({
        body,
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      })

      if (response.status === 'SUCCESS') {
        clear()
        showSuccess(getString('common.environmentGroup.created'))
        history.push(
          routes.toEnvironmentGroupDetails({
            orgIdentifier,
            projectIdentifier,
            accountId,
            module,
            environmentGroupIdentifier: defaultTo(response.data?.envGroup?.identifier, ''),
            sectionId: EnvironmentGroupDetailsTab.ENVIRONMENTS
          })
        )
      } else {
        throw response
      }
    } catch (e: any) {
      showError(getErrorInfoFromErrorObject(e, true))
    }
    setCreateLoading(false)
  }

  const handleModeSwitch = useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = defaultTo(yamlHandler?.getLatestYaml(), '')
        const yamlVisual = parse(yaml).environmentGroup as EnvironmentGroupResponseDTO

        if (yamlVisual) {
          formikRef.current?.setValues({
            ...(cleanData(yamlVisual) as EnvironmentGroupResponseDTO)
          })
        }
      }

      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml]
  )

  const { data: environmentGroupSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'EnvironmentGroup',
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  const queryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      size: pageSize.current,
      searchTerm
    }),
    [accountId, orgIdentifier, projectIdentifier, searchTerm]
  )

  const {
    items: environments,
    error: fetchEnvironmentsError,
    fetching: fetchingEnvironments,
    attachRefToLastElement,
    offsetToFetch
  } = useInfiniteScroll({
    getItems: options => {
      return getEnvironmentListPromise({
        queryParams: { ...queryParams, size: options.limit, page: options.offset }
      })
    },
    limit: pageSize.current,
    loadMoreRef,
    searchTerm
  })

  const isFetchingEnvironmentsFirstTime = useMemo(() => {
    return fetchingEnvironments && offsetToFetch.current === 0
  }, [fetchingEnvironments, offsetToFetch.current])

  const isFetchingEnvironmentsNextTime = useMemo(() => {
    return fetchingEnvironments && offsetToFetch.current > 0
  }, [fetchingEnvironments, offsetToFetch.current])

  const isEmptyContent = useMemo(() => {
    return !fetchingEnvironments && !fetchEnvironmentsError && isEmpty(environments)
  }, [fetchingEnvironments, fetchEnvironmentsError, environments])

  return (
    <>
      <Layout.Horizontal
        flex={{ justifyContent: 'flex-start' }}
        padding={{ top: 'medium', bottom: 'medium' }}
        width={'320px'}
      >
        <VisualYamlToggle
          selectedView={selectedView}
          onChange={nextMode => {
            handleModeSwitch(nextMode)
          }}
        />
      </Layout.Horizontal>
      <Formik<EnvironmentGroupResponseDTO>
        initialValues={
          {
            name: '',
            identifier: '',
            description: '',
            orgIdentifier,
            projectIdentifier,
            tags: {},
            envIdentifiers: []
          } as EnvironmentGroupResponseDTO
        }
        formName="createEnvGroup"
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
                <Layout.Horizontal padding={{ top: 'large', left: 'xsmall', right: 'xsmall' }} border={{ top: true }}>
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

                    <Layout.Horizontal spacing="large">
                      <Button
                        variation={ButtonVariation.PRIMARY}
                        type={'submit'}
                        text={getString('submit')}
                        data-id="environment-group-save"
                        onClick={() => {
                          formikProps.submitForm()
                        }}
                        disabled={isFetchingEnvironmentsFirstTime || isFetchingEnvironmentsNextTime || createLoading}
                      />
                      <Button
                        variation={ButtonVariation.TERTIARY}
                        text={getString('cancel')}
                        onClick={closeModal}
                        disabled={createLoading}
                      />
                    </Layout.Horizontal>
                  </Layout.Vertical>
                  <Layout.Vertical padding={{ left: 'large' }} flex={{ alignItems: 'stretch' }} width={'50%'}>
                    <ExpandingSearchInput
                      alwaysExpanded
                      placeholder={'Search Environments'}
                      autoFocus={false}
                      width={'100%'}
                      onChange={setSearchTerm}
                      throttle={200}
                    />
                    <Layout.Vertical
                      height={300}
                      style={{
                        overflow: 'scroll'
                      }}
                    >
                      {isFetchingEnvironmentsFirstTime ? (
                        <Container flex={{ align: 'center-center' }} height={'100%'}>
                          <Spinner size={32} />
                        </Container>
                      ) : isEmptyContent ? (
                        <Layout.Vertical flex={{ align: 'center-center' }} width={'100%'} height={'100%'}>
                          <img src={EmptyEnvironmentGroup} alt={getString('cd.noEnvironment.title')} />
                          <Heading level={2}>{getString('cd.noEnvironment.title')}</Heading>
                        </Layout.Vertical>
                      ) : (
                        (environments as EnvironmentResponse[])?.map((item, index) => {
                          if (!item?.environment) {
                            return null
                          }

                          const { name, identifier, tags } = item?.environment
                          const checked = selectedEnvironments.some((_id: string) => _id === identifier)

                          return (
                            <Layout.Horizontal
                              width={'100%'}
                              height={60}
                              flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                              padding={{ left: 'medium' }}
                              margin={{ top: 0 }}
                              border={{ bottom: true }}
                              key={identifier}
                              ref={attachRefToLastElement(index) ? loadMoreRef : undefined}
                            >
                              <EnvironmentSelection
                                identifier={identifier}
                                checked={checked}
                                onChange={(e: FormEvent<HTMLInputElement>) => {
                                  if ((e.target as any).checked && identifier) {
                                    formikProps.setFieldValue('envIdentifiers', [...selectedEnvironments, identifier])
                                  } else {
                                    formikProps.setFieldValue(
                                      'envIdentifiers',
                                      selectedEnvironments.filter((_id: string) => _id !== identifier)
                                    )
                                  }
                                }}
                              />
                              <Layout.Vertical>
                                <EnvironmentGroupName name={name} identifier={identifier} tags={tags} />
                              </Layout.Vertical>
                            </Layout.Horizontal>
                          )
                        })
                      )}

                      {isFetchingEnvironmentsNextTime && (
                        <Container padding={{ left: 'xxlarge' }}>
                          <Text icon="loading" iconProps={{ size: 20 }} font={{ align: 'center' }}>
                            {getString('common.environment.fetchNext')}
                          </Text>
                        </Container>
                      )}
                    </Layout.Vertical>
                  </Layout.Vertical>
                </Layout.Horizontal>
              ) : (
                <Container>
                  <YAMLBuilder
                    {...yamlBuilderReadOnlyModeProps}
                    existingJSON={{
                      environmentGroup: {
                        ...formikProps?.values
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
                      text={getString('submit')}
                      onClick={() => {
                        const latestYaml = defaultTo(yamlHandler?.getLatestYaml(), /* istanbul ignore next */ '')
                        onSubmit(parse(latestYaml)?.environmentGroup)
                      }}
                      disabled={createLoading}
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

export function EnvironmentSelection({
  identifier,
  checked,
  onChange
}: {
  identifier?: string
  checked: boolean
  onChange: (e: FormEvent<HTMLInputElement>) => void
}) {
  return (
    <Container padding={{ left: 'xsmall' }}>
      <Checkbox
        name="environments"
        value={identifier}
        checked={checked}
        margin={{ right: 'small' }}
        onChange={onChange}
      />
    </Container>
  )
}
