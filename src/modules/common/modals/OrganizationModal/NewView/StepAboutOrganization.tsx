import React, { useState } from 'react'
import * as Yup from 'yup'

import {
  Button,
  Color,
  Container,
  Formik,
  FormikForm as Form,
  FormInput,
  Heading,
  Layout,
  StepProps
} from '@wings-software/uikit'
import { useParams } from 'react-router-dom'
import { useAppStoreReader, useAppStoreWriter } from 'framework/exports'
import { OrganizationCard } from 'modules/common/components/OrganizationCard/OrganizationCard'
import { usePostOrganization, usePutOrganization } from 'services/cd-ng'
import type { Organization } from 'services/cd-ng'
import type { OrganizationModalInteraction } from '../OrganizationModalUtils'

import i18n from './StepAboutOrganization.i18n'

export const StepAboutOrganization: React.FC<StepProps<Organization> & OrganizationModalInteraction> = props => {
  const { backToSelections, onSuccess, edit, data } = props
  const { accountId } = useParams()
  const { organisationsMap } = useAppStoreReader()
  const updateAppStore = useAppStoreWriter()
  const [org, setOrg] = useState<Organization>(
    (edit && data) || {
      color: '',
      name: '',
      description: '',
      tags: [],
      identifier: ''
    }
  )
  const { mutate: createOrganization } = usePostOrganization({ queryParams: { accountIdentifier: accountId } })
  const { mutate: updateOrganization } = usePutOrganization({
    identifier: org.identifier || '',
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const persistOrg = async (values: Organization): Promise<void> => {
    const dataToSubmit: Organization = {
      name: values.name,
      color: values.color,
      description: values.description,
      tags: values.tags
    }
    try {
      if (edit) {
        await updateOrganization(dataToSubmit)
      } else {
        dataToSubmit['identifier'] = values.identifier || ''
        await createOrganization(dataToSubmit)
      }
      updateAppStore({ organisationsMap: organisationsMap.set(values.identifier || '', values) })
      onSuccess?.()
    } catch (error) {
      // TODO: Implement modal error handling
    }
  }

  return (
    <Layout.Horizontal padding={{ top: 'large', right: 'large', left: 'large' }}>
      <Container width="50%">
        <Heading level={2} color={Color.GREY_800} margin={{ bottom: 'xxlarge' }}>
          {i18n.aboutTitle}
        </Heading>
        <Formik
          initialValues={org}
          validationSchema={Yup.object().shape({
            name: Yup.string().trim().required(),
            identifier: Yup.string().required(),
            color: Yup.string().required()
          })}
          validate={setOrg}
          onSubmit={(values: Organization) => {
            persistOrg(values)
          }}
        >
          {() => (
            <Form>
              <FormInput.InputWithIdentifier inputLabel={i18n.form.name} isIdentifierEditable={!edit} />
              <FormInput.ColorPicker label={i18n.form.color} name="color" color={org?.color} />
              <FormInput.TextArea label={i18n.form.description} name="description" />
              <FormInput.TagInput
                name="tags"
                label={i18n.form.tags}
                items={[]}
                labelFor={name => name as string}
                itemFromNewTag={newTag => newTag}
                tagInputProps={{
                  showClearAllButton: true,
                  allowNewTag: true,
                  placeholder: i18n.form.addTag
                }}
              />
              {/* <FormInput.CheckBox name="preview" label={i18n.form.preview} checked className={css.checkbox} /> */}

              <Layout.Horizontal spacing="small" margin={{ top: 'xxxlarge' }}>
                {!edit && <Button onClick={backToSelections} text={i18n.form.back} />}
                <Button
                  type="submit"
                  style={{ color: 'var(--blue-500)', borderColor: 'var(--blue-500)' }}
                  text={i18n.form.save}
                />
              </Layout.Horizontal>
            </Form>
          )}
        </Formik>
      </Container>
      <Layout.Vertical width="50%" padding={{ top: 'xxlarge', left: 'xxlarge' }} style={{ position: 'relative' }}>
        <Heading level={4} margin={{ bottom: 'xsmall' }}>
          {i18n.preview}
        </Heading>
        <OrganizationCard data={org} isPreview />
        {/* <Button
          minimal
          text={i18n.form.addCollaborators}
          rightIcon="chevron-right"
          onClick={() => nextStep?.(org)}
          style={{ position: 'absolute', left: '20px', bottom: 0 }}
        /> */}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
