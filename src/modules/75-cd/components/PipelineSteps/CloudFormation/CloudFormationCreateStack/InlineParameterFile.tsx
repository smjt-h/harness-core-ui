/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
// import { useParams } from 'react-router-dom'
import { map, defaultTo } from 'lodash-es'
import { Layout, Button, Formik, ButtonVariation, Select, FormInput, Text } from '@harness/uicore'
import { Form, FieldArray } from 'formik'
import { Classes, Dialog } from '@blueprintjs/core'
// import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
// import { useCFParametersForAws } from 'services/cd-ng'
import css from '../CloudFormation.module.scss'

interface InlineParameterFileProps {
  onClose: () => void
  onSubmit: (values: any) => void
  isOpen: boolean
  initialValues: any
}

export const InlineParameterFile = ({
  initialValues,
  onSubmit,
  onClose,
  isOpen
}: InlineParameterFileProps): JSX.Element => {
  const { getString } = useStrings()
  // const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  // const [, setRemoteParams] = useState()

  // const { mutate } = useCFParametersForAws({
  //   queryParams: {
  //     accountIdentifier: accountId,
  //     orgIdentifier: orgIdentifier,
  //     projectIdentifier: projectIdentifier,
  //     awsConnectorRef: '',
  //     type: '',
  //     region: ''
  //   }
  // })

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
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={Yup.object().shape({
            parameters: Yup.array().of(
              Yup.object().shape({
                name: Yup.string().min(1).required(getString('cd.cloudFormation.errors.name')),
                value: Yup.string().min(1).required(getString('cd.cloudFormation.errors.value'))
              })
            )
          })}
          enableReinitialize
        >
          {({ values, setFieldValue }) => {
            const params = defaultTo(values?.parameters, [{ name: '', value: '' }])
            const items = [{ label: 'test', value: 'test' }]
            return (
              <Form>
                <Layout.Horizontal flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                  <Layout.Vertical className={css.overrideSelect}>
                    <Text style={{ color: 'rgb(11, 11, 13)', fontWeight: 'bold' }}>Parameters ({params.length})</Text>
                  </Layout.Vertical>
                  <Layout.Vertical>
                    <a className={css.configPlaceHolder}>Retrieve Names from template</a>
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
                  name="parameters"
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
                              setFieldValue(`parameters[${index}].name`, value)
                            }}
                            items={items}
                            allowCreatingNewItems
                            className={css.overrideSelect}
                            name={`parameters[${index}].name`}
                            value={items.find(param => param.value === params[index].name)}
                          />
                          <FormInput.Text name={`parameters[${index}].value`} label="" placeholder="Value" />
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
