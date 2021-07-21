import React from 'react'
import { Link } from 'react-router-dom'
import { connect, FormikContext } from 'formik'
import { Layout, Container, Text, Color } from '@wings-software/uicore'

import { get, isPlainObject } from 'lodash-es'
import { FormGroup, Intent } from '@blueprintjs/core'
import type { UserGroupDTO } from 'services/cd-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
import useSelectUserGroupsModal from '@common/modals/SelectUserGroups/useSelectUserGroupsModal'
import { useStrings } from 'framework/strings'
import css from './UserGroupsInput.module.scss'

export interface UserGroupsInputProps {
  name: string
  label?: string
  placeholder?: string
  onSuccess?: (userGroups: UserGroupDTO[]) => void
  userGroupsMockData?: UserGroupDTO
}

interface FormikUserGroupsInput extends UserGroupsInputProps {
  formik: FormikContext<any>
}

const UserGroupsInput: React.FC<FormikUserGroupsInput> = props => {
  const { getString } = useStrings()
  const { formik, label, name, onSuccess, placeholder } = props
  const userGroupsReference: UserGroupDTO[] = formik.values[name]

  const { openSelectUserGroupsModal } = useSelectUserGroupsModal({
    onSuccess: data => {
      formik.setFieldValue(name, data)
      onSuccess?.(data)
    }
  })

  const errorCheck = (): boolean =>
    ((get(formik?.touched, name) || (formik?.submitCount && formik?.submitCount > 0)) &&
      get(formik?.errors, name) &&
      !isPlainObject(get(formik?.errors, name))) as boolean

  let mappedUserGroups: { name: Scope; userGroups: UserGroupDTO[] }[] | undefined = undefined
  let inputItems = null
  if (userGroupsReference && userGroupsReference.length > 0) {
    const accArray: UserGroupDTO[] = []
    const projectArray: UserGroupDTO[] = []
    const orgArray: UserGroupDTO[] = []
    userGroupsReference.forEach(group => {
      group.orgIdentifier && orgArray.push(group)
      group.projectIdentifier && !group.orgIdentifier && projectArray.push(group)
      group.accountIdentifier && !group.projectIdentifier && !group.orgIdentifier && accArray.push(group)
    })
    if (accArray.length || projectArray.length || projectArray.length) {
      mappedUserGroups = []
      if (accArray.length) {
        mappedUserGroups.push({ name: Scope.ACCOUNT, userGroups: accArray })
      }
      if (projectArray.length) {
        mappedUserGroups.push({ name: Scope.PROJECT, userGroups: projectArray })
      }
      if (projectArray.length) {
        mappedUserGroups.push({ name: Scope.ORG, userGroups: orgArray })
      }
    }

    inputItems = mappedUserGroups?.length ? (
      <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        {mappedUserGroups.map(scope => {
          return (
            <Container
              padding={{ top: 'xsmall', right: 'small', bottom: 'xsmall', left: 'small' }}
              width={'30%'}
              background={Color.PRIMARY_2}
              key={scope.name}
              onClick={() => {
                openSelectUserGroupsModal(userGroupsReference, scope.name)
              }}
              border={{ radius: 100 }}
              className={css.pointer}
            >
              <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text font={{ size: 'small' }} color={Color.BLACK}>
                  {scope.name.toUpperCase()}
                </Text>
                <Text
                  font={{ size: 'small' }}
                  padding={{ left: 'xsmall', right: 'xsmall' }}
                  flex={{ align: 'center-center' }}
                  background={Color.BLUE_600}
                  color={Color.WHITE}
                  border={{ radius: 100 }}
                >
                  {scope.userGroups.length}
                </Text>
              </Layout.Horizontal>
            </Container>
          )
        })}
      </Layout.Horizontal>
    ) : null
  }

  return (
    <FormGroup
      helperText={errorCheck() ? get(formik?.errors, name) : null}
      intent={errorCheck() ? Intent.DANGER : Intent.NONE}
    >
      <Layout.Vertical>
        {label ? <label className={'bp3-label'}>{label}</label> : null}
        <Container border padding="xsmall">
          {inputItems ? (
            inputItems
          ) : (
            <Link
              to="#"
              className={css.link}
              data-testid={name}
              onClick={e => {
                e.preventDefault()
                openSelectUserGroupsModal()
              }}
            >
              <Text
                color={Color.BLUE_500}
                flex={{ alignItems: 'center', justifyContent: 'flex-start', inline: false }}
                padding="xsmall"
              >
                {placeholder || getString('select')}
              </Text>
            </Link>
          )}
        </Container>
      </Layout.Vertical>
    </FormGroup>
  )
}

export default connect<Omit<FormikUserGroupsInput, 'formik'>>(UserGroupsInput)
