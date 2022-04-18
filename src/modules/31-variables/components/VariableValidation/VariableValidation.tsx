import React from 'react'
import { FormInput } from '@harness/uicore'
import type { FormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import AllowedValuesField from '../AllowedValues/AllowedValuesField'

export enum Validation {
  FixedValue = 'FixedValue',
  AllowedValues = 'AllowedValues',
  Regex = 'Regex'
}

interface VariableValidationProps {
  formik: FormikContext<any>
}

const VariableValidation: React.FC<VariableValidationProps> = props => {
  const { getString } = useStrings()
  return (
    <>
      <FormInput.RadioGroup
        radioGroup={{ inline: true }}
        name="validation"
        label={getString('common.configureOptions.validation')}
        items={[
          { label: getString('inputTypes.FIXED'), value: Validation.FixedValue },
          { label: getString('allowedValues'), value: Validation.AllowedValues },
          { label: getString('common.configureOptions.regex'), value: Validation.Regex }
        ]}
      />
      {props.formik.values.validation === Validation.FixedValue ? (
        <FormInput.Text name="fixedValue" label="Fixed Value" />
      ) : null}
      {props.formik.values.validation === Validation.AllowedValues ? <AllowedValuesField /> : null}
      {props.formik.values.validation === Validation.Regex ? (
        <FormInput.TextArea label={getString('common.configureOptions.regex')} name="regExValues" />
      ) : null}
    </>
  )
}

export default VariableValidation
