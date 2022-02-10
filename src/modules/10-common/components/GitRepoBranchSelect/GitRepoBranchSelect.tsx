/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { FormInput, getErrorInfoFromErrorObject, ModalErrorHandlerBinding, SelectOption } from '@harness/uicore'
import { defaultTo, isEmpty, noop } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import type { FormikContext } from 'formik'
import { GitBranchDTO, useGetListOfBranchesWithStatus } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import css from './GitRepoBranchSelect.module.scss'

export interface GitRepBranchSelectProps<T> {
  repoIdentifier?: string
  name?: string
  disabled?: boolean
  preSelectedBranch?: string
  formik: FormikContext<T>
  modalErrorHandler?: ModalErrorHandlerBinding
  className?: string
  popoverClassName?: string
}

const GitRepoBranchSelect: React.FC<GitRepBranchSelectProps<any>> = props => {
  const {
    repoIdentifier,
    name,
    disabled = false,
    preSelectedBranch = '',
    formik,
    modalErrorHandler,
    className = '',
    popoverClassName = ''
  } = props
  const inputName = defaultTo(name, 'branch')
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [branches, setBranches] = React.useState<SelectOption[]>()
  const [searchTerm, setSearchTerm] = React.useState<string>('')
  const { getString } = useStrings()

  const handleError = (errorMessage: string): void => {
    modalErrorHandler?.showDanger(errorMessage)
  }

  const defaultQueryParam = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    yamlGitConfigIdentifier: repoIdentifier,
    page: 0,
    size: 10,
    searchTerm: ''
  }

  const {
    data: response,
    error,
    loading,
    refetch
  } = useGetListOfBranchesWithStatus({
    queryParams: defaultQueryParam,
    debounce: 500,
    lazy: true
  })

  // Refetch when user selects a different gitSync repo or searches for a branch or branch selection is enabled (ex: create PR enables target branch)
  useEffect(() => {
    if (repoIdentifier && !disabled) {
      setBranches([{ label: '', value: '' }])
      formik?.setFieldValue(inputName, '')
      formik?.setFieldTouched(inputName, false)
      refetch({ queryParams: { ...defaultQueryParam, yamlGitConfigIdentifier: repoIdentifier, searchTerm } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoIdentifier, searchTerm, disabled])

  useEffect(() => {
    if (!loading && !disabled) {
      modalErrorHandler?.hide()

      if (error) {
        handleError(getErrorInfoFromErrorObject(error))
        return
      }

      const branchesInResponse = response?.data?.branches?.content
      /* Show error in case no branches exist on a git repo at all */
      /* A valid git repo should have atleast one branch in it(a.k.a default branch) */
      if (!searchTerm && branchesInResponse && isEmpty(branchesInResponse)) {
        modalErrorHandler?.showDanger(getString('common.git.noBranchesFound'))
        return
      }

      const branchOptions = branchesInResponse?.map((branch: GitBranchDTO) => {
        return { label: branch?.branchName, value: branch?.branchName }
      }) as SelectOption[]

      // Handling for preSelectedBranch may not be in response
      if (
        preSelectedBranch &&
        ((searchTerm && preSelectedBranch.includes(searchTerm)) || !searchTerm) &&
        -1 === branchOptions?.findIndex?.(option => option.value === preSelectedBranch)
      ) {
        branchOptions.unshift({ label: preSelectedBranch, value: preSelectedBranch })
      }

      setBranches(branchOptions)
      searchTerm ? noop() : formik?.setFieldValue(inputName, preSelectedBranch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  return (
    <FormInput.Select
      name={inputName}
      items={defaultTo(branches, [])}
      disabled={disabled}
      data-id={`select-${inputName}`}
      onQueryChange={(query: string) => setSearchTerm(query)}
      selectProps={{ usePortal: true, popoverClassName: cx(css.gitBranchSelectorPopover, popoverClassName) }}
      className={cx(css.branchSelector, className)}
    />
  )
}

export default GitRepoBranchSelect
