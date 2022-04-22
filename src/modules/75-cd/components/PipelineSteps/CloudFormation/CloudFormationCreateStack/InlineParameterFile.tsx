/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { map, isEmpty, find } from 'lodash-es'
import {
  Layout,
  Button,
  Formik,
  ButtonVariation,
  Select,
  FormInput,
  Text,
  useToaster,
  MultiSelectOption
} from '@harness/uicore'
import { Form, FieldArray } from 'formik'
import { Classes, Dialog } from '@blueprintjs/core'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useCFParametersForAws } from 'services/cd-ng'
import css from '../CloudFormation.module.scss'

interface GitDetails {
  gitConnectorRef: string
  commitId?: string
  filePath?: string
  isBranch: boolean
  branch?: string
}

interface InlineParameterFileProps {
  onClose: () => void
  onSubmit: (values: any) => void
  isOpen: boolean
  initialValues: any
  awsConnectorRef: string
  type: string
  region: string
  body: string
  git?: GitDetails
}

enum RequestTypes {
  Remote = 'git',
  S3URL = 's3',
  Inline = 'body'
}

export const InlineParameterFile = ({
  initialValues,
  onSubmit,
  onClose,
  isOpen,
  awsConnectorRef,
  type,
  region,
  body,
  git
}: InlineParameterFileProps): JSX.Element => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [remoteParams, setRemoteParams] = useState<MultiSelectOption[]>()
  const queryParams = {
    awsConnectorRef: awsConnectorRef,
    type: RequestTypes[type as keyof typeof RequestTypes],
    region: region,
    ...git
  }
  const { mutate: getParamsFromAWS } = useCFParametersForAws({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      ...queryParams
    }
  })

  const getParameters = async (): Promise<void> => {
    if (isEmpty(awsConnectorRef) || isEmpty(type) || isEmpty(region)) {
      showError('AWS Connector, Region and Template File cannot be empty')
    } else {
      try {
        const result = await getParamsFromAWS(git ? {} : JSON.parse(body))
        if (result?.data) {
          setRemoteParams(map(result?.data, param => ({ label: param.paramKey!, value: param.paramKey! })))
        }
      } catch (e) {
        showError(e.message)
      }
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      enforceFocus={false}
      title={
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text font="medium" style={{ color: 'rgb(11, 11, 13)' }}>
            CloudFormation Parameter Overrides
          </Text>
        </Layout.Horizontal>
      }
      isCloseButtonShown
      onClose={onClose}
      className={Classes.DIALOG}
    >
      <Layout.Vertical padding="xxlarge">
        <Formik
          formName="inlineParameterFileForm"
          initialValues={{ parameterOverrides: initialValues }}
          onSubmit={onSubmit}
          validationSchema={Yup.object().shape({
            parameterOverrides: Yup.array().of(
              Yup.object().shape({
                name: Yup.string(),
                value: Yup.string()
              })
            )
          })}
          enableReinitialize
        >
          {({ values, setFieldValue }) => {
            const params =
              values?.parameterOverrides.length > 0 ? values?.parameterOverrides : [{ name: '', value: '' }]
            return (
              <Form>
                <Layout.Horizontal flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                  <Layout.Vertical className={css.overrideSelect}>
                    <Text style={{ color: 'rgb(11, 11, 13)', fontWeight: 'bold' }}>Parameters ({params.length})</Text>
                  </Layout.Vertical>
                  <Layout.Vertical>
                    <a onClick={getParameters} className={css.configPlaceHolder}>
                      Retrieve Names from template
                    </a>
                  </Layout.Vertical>
                </Layout.Horizontal>
                <Layout.Horizontal
                  className={css.overridesInputHeader}
                  flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
                >
                  <Layout.Vertical className={css.overrideSelect}>
                    <Text style={{ color: 'rgb(11, 11, 13)' }}>NAME</Text>
                  </Layout.Vertical>
                  <Layout.Vertical>
                    <Text style={{ color: 'rgb(11, 11, 13)' }}>VALUE</Text>
                  </Layout.Vertical>
                </Layout.Horizontal>
                <FieldArray
                  name="parameterOverrides"
                  render={arrayHelpers => (
                    <>
                      {map(params, (item: any, index: number) => (
                        <Layout.Horizontal
                          spacing="medium"
                          className={css.formContainer}
                          key={`${item}-${index}`}
                          draggable={false}
                        >
                          <Select
                            onChange={({ value }) => {
                              setFieldValue(`parameterOverrides[${index}].name`, value)
                            }}
                            items={remoteParams || []}
                            allowCreatingNewItems
                            className={css.overrideSelect}
                            name={`parameterOverrides[${index}].name`}
                            value={find(remoteParams, ['value', item.name]) || { label: item.name, value: item.name }}
                          />
                          <FormInput.Text name={`parameterOverrides[${index}].value`} label="" placeholder="Value" />
                          <Button
                            minimal
                            icon="main-trash"
                            data-testid={`remove-header-`}
                            onClick={() => arrayHelpers.remove(index)}
                          />
                        </Layout.Horizontal>
                      ))}
                      <Button
                        icon="plus"
                        variation={ButtonVariation.LINK}
                        data-testid="add-header"
                        onClick={() => arrayHelpers.push({ name: '', value: '' })}
                      >
                        {getString('add')}
                      </Button>
                    </>
                  )}
                />
                <Layout.Horizontal spacing={'medium'} margin={{ top: 'huge' }}>
                  <Button
                    type="submit"
                    variation={ButtonVariation.PRIMARY}
                    text={getString('submit')}
                    rightIcon="chevron-right"
                  />
                  <Button onClick={onClose} variation={ButtonVariation.TERTIARY} text={getString('cancel')} />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Dialog>
  )
}
