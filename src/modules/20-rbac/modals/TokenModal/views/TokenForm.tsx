/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  Container,
  Formik,
  FormikForm as Form,
  FormInput,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  Checkbox,
  ButtonVariation
} from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { defaultTo, omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { TokenDTO, useCreateToken, useUpdateToken } from 'services/cd-ng'
import type { ProjectPathProps, ServiceAccountPathProps } from '@common/interfaces/RouteInterfaces'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { getReadableDateTime } from '@common/utils/dateUtils'
import { TokenValueRenderer } from './TokenValueRenderer'
import css from '@rbac/modals/TokenModal/useTokenModal.module.scss'

interface TokenModalData {
  data?: TokenDTO
  apiKeyIdentifier: string
  isEdit?: boolean
  apiKeyType?: TokenDTO['apiKeyType']
  parentIdentifier?: string
  onSubmit?: () => void
  onClose?: () => void
}

interface TokenFormData extends TokenDTO {
  expiryDate?: string
}

const TokenForm: React.FC<TokenModalData> = props => {
  const {
    data: tokenData,
    onSubmit,
    onClose,
    isEdit,
    apiKeyIdentifier,
    apiKeyType = 'SERVICE_ACCOUNT',
    parentIdentifier
  } = props
  const { accountId, orgIdentifier, projectIdentifier, serviceAccountIdentifier } = useParams<
    ProjectPathProps & ServiceAccountPathProps
  >()
  const { getRBACErrorMessage } = useRBACError()
  const [expiry, setExpiry] = useState<boolean>(!!tokenData?.validTo)
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: createToken, loading: saving } = useCreateToken({})
  const [token, setToken] = useState<string>()

  const { mutate: editToken, loading: updating } = useUpdateToken({
    identifier: encodeURIComponent(defaultTo(tokenData?.identifier, ''))
  })

  const handleSubmit = async (values: TokenFormData): Promise<void> => {
    const dataToSubmit = Object.assign({}, omit(values, ['expiryDate']))
    if (expiry && values['expiryDate']) dataToSubmit['validTo'] = Date.parse(values['expiryDate'])
    try {
      switch (isEdit) {
        case true: {
          const updated = await editToken(dataToSubmit)
          /* istanbul ignore else */ if (updated) {
            showSuccess(getString('rbac.token.form.editSuccess', { name: values.name }))
            onSubmit?.()
            onClose?.()
          }
          break
        }
        default:
          {
            const created = await createToken(dataToSubmit)
            /* istanbul ignore else */ if (created) {
              showSuccess(getString('rbac.token.form.createSuccess', { name: values.name }))
              onSubmit?.()
              setToken(created.data)
            }
          }
          break
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }
  return (
    <Formik<TokenFormData>
      initialValues={{
        identifier: '',
        name: '',
        description: '',
        tags: {},
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        apiKeyIdentifier,
        parentIdentifier: parentIdentifier || serviceAccountIdentifier,
        apiKeyType: apiKeyType,
        expiryDate: getReadableDateTime(tokenData?.validTo, 'MM/DD/YYYY'),
        ...tokenData
      }}
      formName="tokenForm"
      validationSchema={Yup.object().shape({
        name: NameSchema(),
        identifier: IdentifierSchema(),
        ...(expiry && { expiryDate: Yup.date().min(new Date()).required() })
      })}
      onSubmit={values => {
        modalErrorHandler?.hide()
        handleSubmit(values)
      }}
    >
      {formikProps => {
        return (
          <Form>
            <Container className={cx(css.form, { [css.createTokenForm]: !!token })}>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <NameIdDescriptionTags
                formikProps={formikProps}
                identifierProps={{ isIdentifierEditable: !isEdit && !token }}
              />
              <Layout.Vertical padding={{ top: 'small' }} spacing="medium">
                <Checkbox
                  label={getString('rbac.token.form.expiry')}
                  checked={expiry}
                  onClick={e => setExpiry(e.currentTarget.checked)}
                />
                {expiry && <FormInput.Text name="expiryDate" label={getString('rbac.token.form.expiryDate')} />}
              </Layout.Vertical>
            </Container>
            {token ? (
              <Layout.Vertical spacing="medium">
                <TokenValueRenderer token={token} textInputClass={css.tokenValue} copyTextClass={css.copy} />
                <Button text={getString('close')} onClick={onClose} variation={ButtonVariation.TERTIARY} />
              </Layout.Vertical>
            ) : (
              <Layout.Horizontal spacing="small">
                <Button
                  variation={ButtonVariation.PRIMARY}
                  text={isEdit ? getString('save') : getString('rbac.generateToken')}
                  type="submit"
                  disabled={saving || updating}
                />
                <Button text={getString('cancel')} onClick={onClose} variation={ButtonVariation.TERTIARY} />
              </Layout.Horizontal>
            )}
          </Form>
        )
      }}
    </Formik>
  )
}

export default TokenForm
