/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useState } from 'react'
import { Popover, Position } from '@blueprintjs/core'
import {
  Container,
  Text,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  Button,
  SelectOption,
  Radio,
  Icon,
  ModalErrorHandler,
  ModalErrorHandlerBinding
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import { debounce, isEmpty, pick, defaultTo } from 'lodash-es'
import type { FormikContext } from 'formik'
import {
  GitSyncEntityDTO,
  EntityGitDetails,
  GitBranchDTO,
  getListOfBranchesWithStatusPromise,
  ResponseGitBranchListDTO
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { getEntityNameFromType } from '@common/utils/StringUtils'
import css from './SaveToGitFormV2.module.scss'

export interface GitResourceInterface {
  type: GitSyncEntityDTO['entityType']
  name: string
  identifier: string
  gitDetails?: EntityGitDetails
  storeMetadata?: { connectorRef?: string; storeType?: string }
}

interface SaveToGitFormV2Props {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  isEditing: boolean
  resource: GitResourceInterface
}

interface ModalConfigureProps {
  onClose?: () => void
  onSuccess?: (data: SaveToGitFormV2Interface) => void
}

export interface SaveToGitFormV2Interface {
  isNewBranch: boolean
  branch: string
  targetBranch?: string
  commitMsg: string
  createPr: boolean
}

const SaveToGitFormV2: React.FC<ModalConfigureProps & SaveToGitFormV2Props> = props => {
  const { accountId, projectIdentifier, orgIdentifier, isEditing = false, resource } = props
  const { getString } = useStrings()
  const [isNewBranch, setIsNewBranch] = React.useState(false)
  const [branches, setBranches] = React.useState<SelectOption[]>()
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()
  const formikRef = useRef<FormikContext<SaveToGitFormV2Interface>>()
  const [disableCreatePR, setDisableCreatePR] = useState<boolean>()
  const [showCreatePRWarning, setShowCreatePRWarning] = useState<boolean>(false)
  const [disableBranchSelection, setDisableBranchSelection] = useState<boolean>(true)

  const defaultInitialFormData: SaveToGitFormV2Interface = {
    isNewBranch: false,
    branch: defaultTo(resource.gitDetails?.branch, ''),
    commitMsg: getString(isEditing ? 'common.gitSync.updateResource' : 'common.gitSync.createResource', {
      name: resource.name,
      type: getEntityNameFromType(resource.type)
    }),

    createPr: false,
    targetBranch: ''
  }

  const handleBranchTypeChange = (isNew: boolean, formik: FormikContext<SaveToGitFormV2Interface>): void => {
    if (isNewBranch !== isNew) {
      setIsNewBranch(isNew)
      formik.setFieldValue('branch', `${resource.gitDetails?.branch}-patch`)
      formik.setFieldTouched('branch', false)
    }
    formik.setFieldValue('targetBranch', isNew ? resource.gitDetails?.branch || '' : '')
    formik.setFieldTouched('targetBranch', false)
    formik.setFieldValue('createPr', false)
    formik.setFieldTouched('createPr', false)
    setDisableCreatePR(false)
    setDisableBranchSelection(true)
  }

  const fetchBranches = (query?: string): void => {
    getListOfBranchesWithStatusPromise({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        yamlGitConfigIdentifier: resource.gitDetails?.repoIdentifier || '',
        page: 0,
        size: 10,
        searchTerm: query
      }
    })
      .then((response: ResponseGitBranchListDTO) => {
        const branchesInResponse = response?.data?.branches?.content
        /* Show error in case no branches exist on a git repo at all */
        /* A valid git repo should have atleast one branch in it(a.k.a default branch) */
        if (!query && isEmpty(branchesInResponse)) {
          setDisableCreatePR(true)
          setDisableBranchSelection(true)
          modalErrorHandler?.showDanger(getString('common.git.noBranchesFound'))
          return
        }
        setShowCreatePRWarning(false)
        const branchOptions = branchesInResponse?.map((branch: GitBranchDTO) => {
          return { label: branch?.branchName, value: branch?.branchName }
        }) as SelectOption[]
        const filteredBranches = isNewBranch
          ? branchOptions
          : /* filter out current working branch from list of branches for commit to default branch use-case
               since PR from a branch to itself is not allowed */
            branchOptions?.filter((branch: SelectOption) => branch.value !== resource.gitDetails?.branch)
        if (!isNewBranch && isEmpty(filteredBranches)) {
          setDisableCreatePR(true)
          setDisableBranchSelection(true)
          setShowCreatePRWarning(true)
        } else {
          setBranches(filteredBranches)
          setDisableCreatePR(false)
          setDisableBranchSelection(false)
        }
      })
      .catch(e => {
        /* istanbul ignore next */ modalErrorHandler?.showDanger(e.data?.message || e.message)
      })
  }

  const debounceFetchBranches = debounce((query?: string): void => {
    try {
      fetchBranches(query)
    } catch (e) {
      /* istanbul ignore next */ modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }, 1000)

  const CreatePR = React.useMemo(() => {
    return (
      <Layout.Horizontal flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }} padding={{ top: 'small' }}>
        <FormInput.CheckBox
          disabled={formikRef.current?.values.createPr ? false : disableCreatePR}
          name="createPr"
          label={getString('common.git.startPRLabel')}
          onChange={e => {
            formikRef.current?.setFieldValue('createPr', e.currentTarget.checked)
            if (e.currentTarget.checked) {
              fetchBranches()
            } else {
              setDisableBranchSelection(true)
              setShowCreatePRWarning(false)
            }
          }}
        />
        {showCreatePRWarning ? (
          <Popover
            position={Position.TOP}
            content={
              <Text padding="medium" color={Color.RED_400}>
                {getString('common.git.onlyDefaultBranchFound')}
              </Text>
            }
            isOpen={showCreatePRWarning}
            popoverClassName={css.tooltip}
          >
            <Container margin={{ bottom: 'xlarge' }}></Container>
          </Popover>
        ) : null}
        <FormInput.Select
          name="targetBranch"
          items={defaultTo(branches, [])}
          disabled={disableBranchSelection || disableCreatePR}
          data-id="create-pr-branch-select"
          onQueryChange={(query: string) => debounceFetchBranches(query)}
          selectProps={{ usePortal: true, popoverClassName: css.gitBranchSelectorPopover }}
          className={css.branchSelector}
        />
      </Layout.Horizontal>
    )
  }, [disableCreatePR, disableBranchSelection, branches, isNewBranch, formikRef.current?.values, showCreatePRWarning])

  return (
    <Container height={'inherit'} className={css.modalContainer}>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Text
        className={css.modalHeader}
        font={{ weight: 'semi-bold' }}
        color={Color.GREY_800}
        padding={{ bottom: 'small' }}
        margin={{ bottom: 'small', top: 'xlarge' }}
      >
        {getString('common.git.saveResourceLabel', { resource: props.resource.type })}
      </Text>

      <Container className={css.modalBody}>
        <Formik<SaveToGitFormV2Interface>
          initialValues={defaultInitialFormData}
          formName="saveToGitFormV2"
          validationSchema={Yup.object().shape({
            branch: Yup.string()
              .trim()
              .required(getString('validation.branchName'))
              .when('createPr', {
                is: true,
                then: Yup.string().notOneOf([Yup.ref('targetBranch')], getString('common.git.validation.sameBranches'))
              }),
            targetBranch: Yup.string()
              .trim()
              .when('createPr', {
                is: true,
                then: Yup.string().required(getString('common.git.validation.targetBranch'))
              }),
            commitMsg: Yup.string().trim().min(1).required(getString('common.git.validation.commitMessage'))
          })}
          onSubmit={formData => {
            props.onSuccess?.({
              ...pick(formData, ['commitMsg', 'createPr', 'targetBranch']),
              isNewBranch,
              branch: isNewBranch ? formData.branch : defaultInitialFormData.branch
            })
          }}
        >
          {formik => {
            formikRef.current = formik
            return (
              <FormikForm>
                <Container className={css.formBody}>
                  <FormInput.TextArea name="commitMsg" label={getString('common.git.commitMessage')} />
                  <Text
                    font={{ size: 'medium' }}
                    color={Color.GREY_600}
                    padding={{ bottom: 'small' }}
                    margin={{ top: 'large' }}
                  >
                    {getString('common.git.branchSelectHeader')}
                  </Text>
                  <Layout.Vertical spacing="medium">
                    <Container
                      className={css.branchSection}
                      padding={{
                        top: 'small',
                        bottom: 'xSmall'
                      }}
                    >
                      <Radio large onChange={() => handleBranchTypeChange(false, formik)} checked={!isNewBranch}>
                        <Icon name="git-branch-existing"></Icon>
                        <Text margin={{ left: 'small' }} inline>
                          {getString('common.git.existingBranchCommitLabel')}
                        </Text>
                        <Text
                          margin={{ left: 'small' }}
                          inline
                          padding={{ top: 'xsmall', bottom: 'xsmall', left: 'small', right: 'small' }}
                          background={Color.PRIMARY_2}
                          border={{ radius: 5 }}
                          color={Color.BLACK}
                        >
                          {defaultInitialFormData.branch}
                        </Text>
                      </Radio>
                      {!isNewBranch && CreatePR}
                    </Container>
                    <Container
                      className={css.branchSection}
                      padding={{
                        bottom: isNewBranch ? 'xSmall' : 'small'
                      }}
                    >
                      <Radio
                        data-test="newBranchRadioBtn"
                        large
                        onChange={() => handleBranchTypeChange(true, formik)}
                        checked={isNewBranch}
                      >
                        <Icon name="git-new-branch" color={Color.GREY_700}></Icon>
                        <Text inline margin={{ left: 'small' }}>
                          {getString('common.git.newBranchCommitLabel')}
                        </Text>
                      </Radio>
                      {isNewBranch && (
                        <Container padding={{ top: 'small' }}>
                          <FormInput.Text
                            className={css.branchInput}
                            name="branch"
                            label={getString('common.git.branchName')}
                          />
                          {CreatePR}
                        </Container>
                      )}
                    </Container>
                  </Layout.Vertical>
                </Container>

                <Layout.Horizontal padding={{ top: 'medium' }} spacing="medium">
                  <Button className={css.formButton} type="submit" intent="primary" text={getString('save')} />
                  <Button
                    className={css.formButton}
                    text={getString('cancel')}
                    margin={{ left: 'medium' }}
                    onClick={props.onClose}
                  />
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Container>
    </Container>
  )
}

export default SaveToGitFormV2
