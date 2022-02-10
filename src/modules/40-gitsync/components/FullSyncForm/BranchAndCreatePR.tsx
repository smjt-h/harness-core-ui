/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Container,
  Text,
  Color,
  Layout,
  FormInput,
  Radio,
  Icon,
  FontVariation,
  ModalErrorHandlerBinding
} from '@harness/uicore'
import type { FormikContext, FormikProps } from 'formik'
import { noop, defaultTo } from 'lodash-es'
import GitRepoBranchSelect from '@common/components/GitRepoBranchSelect/GitRepoBranchSelect'
import type {
  GitFullSyncConfigDTO,
  GitFullSyncConfigRequestDTO,
  GitSyncConfig,
  ResponseGitFullSyncConfigDTO
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import css from './FullSyncForm.module.scss'

export interface CreatePRProps {
  currentConfig: ResponseGitFullSyncConfigDTO | null
  isNewBranch: boolean
  formik: FormikContext<GitFullSyncConfigRequestDTO>
  defaultValue: boolean
  createPRChangeHandler: (creatingPR: boolean) => void
  modalErrorHandler: ModalErrorHandlerBinding | undefined
}

export interface BranchAndCreatePRProps {
  currentConfig: ResponseGitFullSyncConfigDTO | null
  formik: FormikContext<GitFullSyncConfigRequestDTO>
  formikRef: React.MutableRefObject<FormikProps<GitFullSyncConfigRequestDTO> | undefined>
  branchTypeChangeHandler: (isNew: boolean) => void
  modalErrorHandler: ModalErrorHandlerBinding | undefined
}

const getDefaultBranchForPR = (isNew: boolean, defaultBranch?: string): string => (isNew ? defaultBranch || '' : '')

const getPreselectedBranch = (
  branch: string | undefined,
  repoIdentifier: string,
  isNewBranch: boolean,
  config?: GitFullSyncConfigDTO
): string => {
  return branch && repoIdentifier === config?.repoIdentifier && isNewBranch === config?.newBranch ? branch : ''
}

const CreatePR: React.FC<CreatePRProps> = props => {
  const { formik, defaultValue = false, createPRChangeHandler = noop, modalErrorHandler, isNewBranch = false } = props
  const config = props?.currentConfig?.data
  const [createPR, setCreatePR] = useState<boolean>(defaultValue) //used for rendering PR title
  const { getString } = useStrings()
  return (
    <>
      <Layout.Horizontal flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }} padding={{ top: 'small' }}>
        <FormInput.CheckBox
          name="createPullRequest"
          label={getString('common.git.startPRLabel')}
          onChange={e => {
            const creatingPR = e.currentTarget.checked
            formik.setFieldValue('createPullRequest', creatingPR)
            formik.setFieldTouched('targetBranch', false)
            setCreatePR(creatingPR)
            createPRChangeHandler(creatingPR)
          }}
        />
        <GitRepoBranchSelect
          name="targetBranch"
          repoIdentifier={formik.values?.repoIdentifier}
          preSelectedBranch={getPreselectedBranch(
            config?.targetBranch,
            formik?.values?.repoIdentifier,
            isNewBranch,
            config
          )}
          formik={formik}
          disabled={!createPR}
          modalErrorHandler={modalErrorHandler}
        />
      </Layout.Horizontal>
      {createPR ? <FormInput.Text name="prTitle" className={css.prTitle} label={getString('gitsync.PRTitle')} /> : null}
    </>
  )
}

const BranchAndCreatePR: React.FC<BranchAndCreatePRProps> = props => {
  const { currentConfig, formik, formikRef, branchTypeChangeHandler = noop, modalErrorHandler } = props
  const config = currentConfig?.data
  const { getString } = useStrings()
  const { gitSyncRepos } = useGitSyncStore()
  const [isNewBranch, setIsNewBranch] = React.useState(defaultTo(config?.newBranch, false))
  const [createPR, setCreatePR] = useState<boolean>(defaultTo(config?.createPullRequest, false)) //used for rendering PR title

  const createPRChangeHandler = (creatingPR: boolean): void => {
    setCreatePR(creatingPR)
  }

  const resetCreatePRFields = (): void => {
    formik.setFieldValue('targetBranch', '')
    formik.setFieldTouched('targetBranch', false)
    formik.setFieldValue('createPullRequest', false)
    formik.setFieldTouched('createPullRequest', false)
    formikRef.current?.setFieldValue('createPullRequest', false)
    formikRef.current?.setFieldValue('targetBranch', false)
    setCreatePR(false)
  }

  const handleBranchTypeChange = (isNew: boolean): void => {
    const defaultBranch = gitSyncRepos.find(
      (repo: GitSyncConfig) => repo.identifier === formikRef.current?.values.repoIdentifier
    )?.branch
    if (isNewBranch !== isNew) {
      setIsNewBranch(isNew)
      branchTypeChangeHandler(isNew)
      formik.setFieldValue('branch', `${defaultBranch}-patch`)
      formik.setFieldTouched('branch', false)
    }
    formik.setFieldValue('targetBranch', getDefaultBranchForPR(isNew, defaultBranch))
    resetCreatePRFields()
  }

  useEffect(() => {
    if (formik.values.repoIdentifier === config?.repoIdentifier) {
      setIsNewBranch(defaultTo(config?.newBranch, false))
      setCreatePR(defaultTo(config?.createPullRequest, false))
    } else {
      resetCreatePRFields()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.repoIdentifier])

  return (
    <>
      <Text font={{ variation: FontVariation.FORM_SUB_SECTION }} margin={{ top: 'xlarge' }}>
        {getString('gitsync.syncBranchTitle')}
      </Text>
      <Layout.Vertical spacing="medium" margin={{ bottom: 'medium' }}>
        <Container className={css.branchSection}>
          <Layout.Horizontal flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }}>
            <Radio large onChange={() => handleBranchTypeChange(false)} checked={!isNewBranch}>
              <Icon name="git-branch-existing"></Icon>
              <Text margin={{ left: 'small' }} inline>
                {getString('gitsync.selectBranchTitle')}
              </Text>
            </Radio>
            <GitRepoBranchSelect
              name="branch"
              repoIdentifier={formik.values?.repoIdentifier}
              preSelectedBranch={getPreselectedBranch(
                config?.branch,
                formik?.values?.repoIdentifier,
                isNewBranch,
                config
              )}
              formik={formik}
              disabled={isNewBranch}
              modalErrorHandler={modalErrorHandler}
            />
          </Layout.Horizontal>
          {isNewBranch ? null : (
            <CreatePR
              currentConfig={currentConfig}
              isNewBranch={isNewBranch}
              formik={formik}
              defaultValue={createPR}
              createPRChangeHandler={createPRChangeHandler}
              modalErrorHandler={modalErrorHandler}
            />
          )}
        </Container>
        <Container className={css.branchSection}>
          <Radio
            data-test="newBranchRadioBtn"
            large
            onChange={() => handleBranchTypeChange(true)}
            checked={isNewBranch}
          >
            <Icon name="git-new-branch" color={Color.GREY_700}></Icon>
            <Text inline margin={{ left: 'small' }}>
              {getString('gitsync.createBranchTitle')}
            </Text>
          </Radio>
          {isNewBranch ? (
            <Container padding={{ top: 'small' }}>
              <FormInput.Text className={css.branchInput} name="branch" label={getString('common.git.branchName')} />
              {
                <CreatePR
                  currentConfig={currentConfig}
                  isNewBranch={isNewBranch}
                  formik={formik}
                  defaultValue={createPR}
                  createPRChangeHandler={createPRChangeHandler}
                  modalErrorHandler={modalErrorHandler}
                />
              }
            </Container>
          ) : null}
        </Container>
      </Layout.Vertical>
    </>
  )
}

export default BranchAndCreatePR
