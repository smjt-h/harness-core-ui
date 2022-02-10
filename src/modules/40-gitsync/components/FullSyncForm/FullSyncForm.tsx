/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  Container,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  Button,
  SelectOption,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  PageSpinner,
  useToaster
} from '@harness/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import type { FormikContext } from 'formik'
import { useParams } from 'react-router-dom'
import {
  GitSyncConfig,
  GitFullSyncConfigRequestDTO,
  useGetGitFullSyncConfig,
  Failure,
  GitSyncFolderConfigDTO,
  updateGitFullSyncConfigPromise,
  createGitFullSyncConfigPromise,
  triggerFullSyncPromise
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import SCMCheck from '@common/components/SCMCheck/SCMCheck'
import BranchAndCreatePR from './BranchAndCreatePR'
import css from './FullSyncForm.module.scss'

const defaultInitialFormData: GitFullSyncConfigRequestDTO = {
  baseBranch: '',
  branch: '',
  createPullRequest: false,
  newBranch: false,
  prTitle: '',
  repoIdentifier: '',
  rootFolder: '',
  targetBranch: ''
}

interface FullSyncFormProps {
  isNewUser: boolean
  classname?: string
}

interface ModalConfigureProps {
  onClose?: () => void
  onSuccess?: () => void
}

const getRootFolderSelectOptions = (folders: GitSyncFolderConfigDTO[] | undefined): SelectOption[] => {
  return folders?.length
    ? folders.map((folder: GitSyncFolderConfigDTO) => {
        return {
          label: folder.rootFolder || '',
          value: folder.rootFolder || ''
        }
      })
    : []
}

const showSpinner = (isNewUser: boolean, loadingConfig: boolean, loadingRepos: boolean): boolean =>
  (!isNewUser && loadingConfig) || loadingRepos

const readyToFetchConfig = (projectIdentifier: string, repos: GitSyncConfig[]): boolean =>
  !!(projectIdentifier && repos?.length)

const hasToProcessConfig = (loadingConfig: boolean, repos: GitSyncConfig[]): boolean =>
  !loadingConfig && !!repos?.length

const FullSyncForm: React.FC<ModalConfigureProps & FullSyncFormProps> = props => {
  const { isNewUser = true, onClose, onSuccess } = props
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()

  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()
  const formikRef = useRef<FormikContext<GitFullSyncConfigRequestDTO>>()
  const [hasSCM, setHasSCM] = React.useState<boolean>(false)
  const [rootFolderSelectOptions, setRootFolderSelectOptions] = React.useState<SelectOption[]>([])
  const [repoSelectOptions, setRepoSelectOptions] = React.useState<SelectOption[]>([])
  const [isNewBranch, setIsNewBranch] = React.useState(false)

  const handleBranchTypeChange = (isNew: boolean): void => {
    if (isNewBranch !== isNew) {
      setIsNewBranch(isNew)
    }
  }

  const [defaultFormData, setDefaultFormData] = useState<GitFullSyncConfigRequestDTO>({
    ...defaultInitialFormData,
    prTitle: getString('gitsync.deafaultSyncTitle')
  })

  const {
    data: configResponse,
    loading: loadingConfig,
    error: configError,
    refetch
  } = useGetGitFullSyncConfig({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })

  const handleConfigResponse = (): void => {
    if ('SUCCESS' === configResponse?.status || 'RESOURCE_NOT_FOUND' === (configError as Failure)?.code) {
      initiliazeConfigForm()
    } else {
      //Closing edit config modal with error toaster if fetch config API has failed
      showError(configError?.message)
      onClose?.()
    }
  }

  const initiliazeConfigForm = (): void => {
    const config = configResponse?.data

    // Setting up default form fields
    // formikRef used for repo change, config used for default while edit, gitSyncRepos[0] is default for new config
    const repoIdentifier =
      formikRef?.current?.values?.repoIdentifier || config?.repoIdentifier || defaultTo(gitSyncRepos[0].identifier, '')
    const selectedRepo = gitSyncRepos.find((repo: GitSyncConfig) => repo.identifier === repoIdentifier)
    const baseBranch = selectedRepo?.branch

    const defaultRootFolder = selectedRepo?.gitSyncFolderConfigDTOs?.find(
      (folder: GitSyncFolderConfigDTO) => folder.isDefault
    )
    const rootFolder = config?.rootFolder || defaultTo(defaultRootFolder?.rootFolder, '')
    const branch = defaultTo(config?.branch, '')
    const createPullRequest = defaultTo(config?.createPullRequest, false)
    const prTitle = defaultTo(config?.prTitle, defaultInitialFormData?.prTitle)

    formikRef?.current?.setFieldValue('repoIdentifier', repoIdentifier)
    formikRef?.current?.setFieldValue('branch', branch)
    formikRef?.current?.setFieldValue('createPullRequest', createPullRequest)
    formikRef?.current?.setFieldValue('rootFolder', rootFolder)
    formikRef?.current?.setFieldValue('prTitle', prTitle)

    setIsNewBranch(defaultTo(config?.newBranch, false))
    setDefaultFormData({
      ...defaultInitialFormData,
      repoIdentifier,
      baseBranch,
      branch,
      rootFolder,
      prTitle
    })

    // Setting up default repo and rootFolder dropdown options
    setRootFolderSelectOptions(getRootFolderSelectOptions(selectedRepo?.gitSyncFolderConfigDTOs))
    setRepoSelectOptions(
      gitSyncRepos?.map((gitRepo: GitSyncConfig) => {
        return {
          label: defaultTo(gitRepo.name, ''),
          value: defaultTo(gitRepo.identifier, '')
        }
      })
    )
  }

  useEffect(() => {
    if (readyToFetchConfig(projectIdentifier, gitSyncRepos)) {
      isNewUser ? initiliazeConfigForm() : refetch() // Fetching config once context repos are available
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gitSyncRepos, projectIdentifier])

  useEffect(() => {
    if (hasToProcessConfig(loadingConfig, gitSyncRepos)) {
      handleConfigResponse()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingConfig])

  const handleRepoChange = (repoIdentifier: string, formik: FormikContext<GitFullSyncConfigRequestDTO>): void => {
    const changedRepo = gitSyncRepos.find((repo: GitSyncConfig) => repo.identifier === repoIdentifier)
    const defaultRootFolder = changedRepo?.gitSyncFolderConfigDTOs?.find(
      (folder: GitSyncFolderConfigDTO) => folder.isDefault
    )?.rootFolder
    formik.setFieldValue('branch', '')
    formikRef?.current?.setFieldValue('branch', '')
    formik.setFieldTouched('branch', false)
    setRootFolderSelectOptions(getRootFolderSelectOptions(changedRepo?.gitSyncFolderConfigDTOs))
    formik.setFieldValue('rootFolder', defaultTo(defaultRootFolder, ''))
  }

  const saveAndTriggerFullSync = async (fullSyncData: GitFullSyncConfigRequestDTO): Promise<void> => {
    const queryParams = {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }

    try {
      const reqObj = {
        queryParams,
        body: { ...fullSyncData, newBranch: isNewBranch }
      }
      modalErrorHandler?.hide()
      // Need to 1st edit config then triger fullSync
      const fullSyncConfigData = configResponse?.data
        ? await updateGitFullSyncConfigPromise(reqObj)
        : await createGitFullSyncConfigPromise(reqObj)

      if (fullSyncConfigData.status !== 'SUCCESS') {
        throw fullSyncConfigData
      } else {
        showSuccess(getString('gitsync.configSaveToaster'))
      }
      const triggerFullSync = await triggerFullSyncPromise({ queryParams, body: {} as unknown as void })
      if (triggerFullSync.status !== 'SUCCESS') {
        throw triggerFullSync
      }
      showSuccess(getString('gitsync.syncSucessToaster'))
      onSuccess?.()
    } catch (err) {
      modalErrorHandler?.showDanger(err.message)
    }
  }

  // For new user form is used in GItSync StepWizard, where using PageSpinner as overlay with step
  // For edit, form is used in modal where showing PageSpinner till data is available
  if (!isNewUser && showSpinner(isNewUser, loadingConfig, loadingRepos)) {
    return <PageSpinner />
  }

  return (
    <>
      {showSpinner(isNewUser, loadingConfig, loadingRepos) ? <PageSpinner className={css.spinner} /> : <></>}

      <Container className={cx(css.modalContainer, { [css.isModalStep]: isNewUser })}>
        <SCMCheck
          profileLinkClickHandler={onClose}
          title={getString('gitsync.fullSyncTitle')}
          validateSCM={isValid => setHasSCM(isValid)}
        />
        <ModalErrorHandler bind={setModalErrorHandler} />
        <Container className={css.modalBody}>
          <Formik<GitFullSyncConfigRequestDTO>
            initialValues={defaultFormData}
            formName="fullSyncConfigForm"
            validationSchema={Yup.object().shape({
              repoIdentifier: Yup.string().trim().required(getString('common.validation.repositoryName')),
              branch: Yup.string()
                .trim()
                .required(getString('validation.branchName'))
                .when('createPullRequest', {
                  is: true,
                  then: Yup.string().notOneOf(
                    [Yup.ref('targetBranch')],
                    getString('common.git.validation.sameBranches')
                  )
                }),
              targetBranch: Yup.string()
                .trim()
                .when('createPullRequest', {
                  is: true,
                  then: Yup.string().required(getString('common.git.validation.targetBranch'))
                }),
              prTitle: Yup.string().trim().min(1).required(getString('common.git.validation.PRTitleRequired'))
            })}
            onSubmit={formData => {
              saveAndTriggerFullSync(formData)
            }}
          >
            {formik => {
              formikRef.current = formik
              return (
                <FormikForm>
                  <Container className={css.formBody}>
                    <FormInput.Select
                      name="repoIdentifier"
                      className={css.repoRootfolderSelect}
                      label={getString('common.git.selectRepoLabel')}
                      items={repoSelectOptions}
                      disabled={isNewUser}
                      onChange={(selected: SelectOption) => {
                        handleRepoChange(defaultTo(selected.value.toString(), ''), formik)
                      }}
                    />
                    <FormInput.Select
                      name="rootFolder"
                      className={css.repoRootfolderSelect}
                      label={getString('common.gitSync.harnessFolderLabel')}
                      items={rootFolderSelectOptions}
                      disabled={isNewUser}
                    />

                    <BranchAndCreatePR
                      currentConfig={configResponse}
                      formik={formik}
                      formikRef={formikRef}
                      branchTypeChangeHandler={handleBranchTypeChange}
                      modalErrorHandler={modalErrorHandler}
                    />
                  </Container>

                  <Layout.Horizontal spacing="medium">
                    <Button type="submit" intent="primary" text={getString('save')} disabled={!hasSCM} />
                    <Button text={getString('cancel')} margin={{ left: 'medium' }} onClick={onClose} />
                  </Layout.Horizontal>
                </FormikForm>
              )
            }}
          </Formik>
        </Container>
      </Container>
    </>
  )
}

export default FullSyncForm
