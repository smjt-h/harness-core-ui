import { FormInput } from '@harness/uicore'
import React from 'react'

const AllowedValuesField = () => {
  return (
    <>
      <FormInput.Text name="defaultVaule" label="Default Value" />
      <FormInput.KVTagInput
        //   className={css.secondColumn}
        label={'Allowed values'}
        name="allowedValues"
        isArray={true}
        //   disabled={isReadonly}
      />
    </>
  )
}

export default AllowedValuesField
