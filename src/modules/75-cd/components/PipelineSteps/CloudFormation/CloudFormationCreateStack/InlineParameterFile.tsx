/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { map, defaultTo } from 'lodash-es'
import { Layout, Button, Formik, ButtonVariation, DropDown, FormInput, Icon } from '@harness/uicore'
import { Form, FieldArray } from 'formik'
import { Classes, Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { onDragStart, onDragEnd, onDragLeave, onDragOver, onDrop } from '../DragHelper'
import css from '../CloudFormation.module.scss'

interface InlineParameterFileProps {
  onClose: () => void
  onSubmit: (values: any) => void
  isOpen: boolean
  initialValues: { value: string; name: string }[]
}

export const InlineParameterFile = ({
  initialValues,
  onSubmit,
  onClose,
  isOpen
}: InlineParameterFileProps): JSX.Element => {
  const { getString } = useStrings()
  return (
    <Dialog
      isOpen={isOpen}
      enforceFocus={false}
      title={'Add Inline CloudFormation Parameter'}
      isCloseButtonShown
      onClose={onClose}
      className={Classes.DIALOG}
    >
      <Layout.Vertical padding="medium">
        <Formik
          formName="inlineParameterFileForm"
          initialValues={{
            parameters: initialValues
          }}
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
            return (
              <Form>
                <FieldArray
                  name="parameters"
                  render={arrayHelpers => (
                    <>
                      {map(params, (item: any, index: number) => (
                        <Layout.Horizontal
                          key={`${item}-${index}`}
                          flex={{ distribution: 'space-between' }}
                          style={{ alignItems: 'end' }}
                        >
                          <Layout.Horizontal
                            spacing="medium"
                            style={{ alignItems: 'baseline' }}
                            className={css.formContainer}
                            key={`${item}-${index}`}
                            draggable={true}
                            onDragEnd={onDragEnd}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDragStart={event => onDragStart(event, index)}
                            onDrop={event => onDrop(event, arrayHelpers, index)}
                          >
                            <Icon name="drag-handle-vertical" className={css.drag} />
                            <DropDown
                              buttonTestId={`inlineParamKeys[${index}]`}
                              onChange={({ value }) => {
                                setFieldValue(`parameters[${index}].name`, value)
                              }}
                              items={[{ label: 'test', value: 'test' }]}
                              placeholder="Select key name"
                              usePortal={true}
                              filterable={false}
                              value={item.name}
                            />
                            <FormInput.Text name={`parameters[${index}].value`} label="" placeholder="Value" />
                            <Button
                              minimal
                              icon="main-trash"
                              data-testid={`remove-header-`}
                              onClick={() => arrayHelpers.remove(index)}
                            />
                          </Layout.Horizontal>
                        </Layout.Horizontal>
                      ))}
                      <Button
                        icon="plus"
                        variation={ButtonVariation.LINK}
                        data-testid="add-header"
                        onClick={() => arrayHelpers.push({ name: '', value: '' })}
                      >
                        {getString('cd.addTFVarFileLabel')}
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
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Dialog>
  )
}
