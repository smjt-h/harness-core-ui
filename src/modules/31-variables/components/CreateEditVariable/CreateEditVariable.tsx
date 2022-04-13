/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { Button, ButtonVariation, Formik, FormikForm, FormInput, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { NameIdDescription } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'

const CreateEditVariable: React.FC<any> = () => {
  const { getString } = useStrings()

  return (
    <Formik
      formName={'variable-form'}
      initialValues={{}}
      enableReinitialize
      validationSchema={Yup.object().shape({
        name: NameSchema(),
        identifier: IdentifierSchema()
      })}
      onSubmit={() => {
        // if (data && selectedVariable) {
        //   if (selectedVariable.index === -1) {
        //     addNewVariable(data)
        //   } else {
        //     updateVariable(selectedVariable.index, data)
        //   }
        //   closeModal()
        // }
      }}
    >
      {formik => (
        <FormikForm data-testid="add-edit-variable">
          {/* <FormInput.Text
            name="name"
            label={getString('variableNameLabel')}
            placeholder={getString('pipeline.variable.variableNamePlaceholder')}
          /> */}
          <NameIdDescription formikProps={formik} />
          <FormInput.Select
            name="type"
            items={[]}
            // items={getVaribaleTypeOptions(getString)}
            label={getString('typeLabel')}
            // placeholder={'Type'}
          />
          <Layout.Horizontal>
            <Button
              type="submit"
              variation={ButtonVariation.PRIMARY}
              text={getString('save')}
              data-testid="addVariableSave"
            />

            <Button
              variation={ButtonVariation.TERTIARY}
              text={getString('cancel')}
              //   onClick={() => closeModal()}
              data-testid="addVariableCancel"
            />
          </Layout.Horizontal>
        </FormikForm>
      )}
    </Formik>
  )
}

export default CreateEditVariable
