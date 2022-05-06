/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonVariation,
  Formik,
  FormikForm as Form,
  FormInput,
  Heading,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  PageSpinner,
  SelectOption
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useGetFolder, ErrorResponse, FolderModel } from 'services/custom-dashboards'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './HomePage.module.scss'

const TAGS_SEPARATOR = ','

interface DashboardFormProps {
  formData?: DashboardFormRequestProps
  title: string
  loading: boolean
  onComplete: (data: DashboardFormRequestProps) => void
  modalErrorHandler?: ModalErrorHandlerBinding
  setModalErrorHandler: (modalErrorHandler: ModalErrorHandlerBinding) => void
}

export interface DashboardFormRequestProps {
  description?: string
  folderId: string
  name: string
}

export interface DashboardFormikValues {
  description: string[]
  folderId: string
  name: string
}

const DashboardForm: React.FC<DashboardFormProps> = ({
  formData,
  title,
  loading,
  onComplete,
  modalErrorHandler,
  setModalErrorHandler
}) => {
  const sharedFolderId = 'shared'

  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  const sharedFolder = {
    value: sharedFolderId,
    label: getString('dashboards.sharedFolderTitle')
  }

  const {
    data: foldersList,
    error,
    loading: isFoldersLoading
  } = useGetFolder({
    queryParams: { accountId }
  })

  function isMissingFolderId(folders: SelectOption[]): boolean {
    return !folders.some((item: SelectOption) => item.value === formData?.folderId)
  }

  React.useEffect(() => {
    const errorResponse = error?.data as ErrorResponse
    if (errorResponse?.responseMessages) {
      modalErrorHandler?.showDanger(errorResponse.responseMessages)
    }
  }, [error, modalErrorHandler])

  const folderListItems = React.useMemo(() => {
    let mappedFolders: SelectOption[] = []
    if (foldersList?.resource) {
      mappedFolders = foldersList.resource?.map((folder: FolderModel): SelectOption => {
        return { value: folder?.id, label: folder?.name }
      })
    }
    return [sharedFolder, ...mappedFolders]
  }, [foldersList])

  const initialValues: DashboardFormikValues = React.useMemo(() => {
    let folderId = formData?.folderId || ''
    if (isMissingFolderId(folderListItems)) {
      folderId = 'shared'
    }
    return {
      folderId,
      name: formData?.name || '',
      description: formData?.description?.split(TAGS_SEPARATOR) || []
    }
  }, [folderListItems])

  return (
    <Layout.Vertical padding="xxlarge" spacing="large">
      <Heading level={3} font={{ variation: FontVariation.H3 }}>
        {title}
      </Heading>
      <ModalErrorHandler bind={setModalErrorHandler} />
      {isFoldersLoading ? (
        <PageSpinner />
      ) : (
        <Formik
          initialValues={initialValues}
          enableReinitialize
          formName="dashboardForm"
          validationSchema={Yup.object().shape({
            folderId: Yup.string().trim().required(getString('dashboards.createFolder.folderNameValidation')),
            name: Yup.string().trim().required(getString('dashboards.createModal.nameValidation'))
          })}
          onSubmit={(completedFormData: DashboardFormikValues) => {
            onComplete({
              ...completedFormData,
              description: completedFormData.description?.join(TAGS_SEPARATOR) || ''
            })
          }}
        >
          <Form className={css.formContainer}>
            <Layout.Vertical spacing="large">
              <FormInput.Select
                name="folderId"
                items={folderListItems}
                label={getString('dashboards.homePage.folder')}
                placeholder={getString('dashboards.resourceModal.folders')}
              />
              <FormInput.Text
                name="name"
                label={getString('name')}
                placeholder={getString('dashboards.createModal.namePlaceholder')}
              />
              <FormInput.KVTagInput name="description" label={getString('tagsLabel')} isArray={true} />
              <Button
                className={css.button}
                disabled={loading}
                intent="primary"
                text={getString('continue')}
                type="submit"
                variation={ButtonVariation.PRIMARY}
              />
            </Layout.Vertical>
          </Form>
        </Formik>
      )}
    </Layout.Vertical>
  )
}

export default DashboardForm
