/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar, Color, Container, FontVariation, Icon, Layout, Text } from '@harness/uicore'
import { noop, defaultTo } from 'lodash-es'
import cx from 'classnames'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import paths from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings/String'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './SCMCheck.module.scss'

export interface SCMCheckProps {
  profileLinkClickHandler?: () => void // If used inside modal, this can be use to close modal
  title?: string
  className?: string
  validateSCM?: (hasValidSCM: boolean) => void // Can be used to disable the commit
}

const SCMCheck: React.FC<SCMCheckProps> = props => {
  const { codeManagers, loadingCodeManagers } = useGitSyncStore()
  const { accountId } = useParams<AccountPathProps>()
  const [currentUserInfo, setCurrentUserInfo] = React.useState('')
  const { getString } = useStrings()
  const { validateSCM = noop, profileLinkClickHandler = noop, className = '', title } = props

  const getUserDisplayName = (user?: string): string => {
    return defaultTo(user, getString('na'))
  }

  useEffect(() => {
    const userSpec = codeManagers?.[0]?.authentication?.spec?.spec
    const user = userSpec?.username || userSpec?.usernameRef

    setCurrentUserInfo(user)
    validateSCM(!loadingCodeManagers && user)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeManagers])

  return (
    <Container className={cx(className)} margin={{ bottom: 'large' }}>
      {currentUserInfo ? (
        <Layout.Horizontal className={css.userInfo} flex={{ alignItems: 'center' }}>
          <Avatar
            size="small"
            name={getUserDisplayName(currentUserInfo)}
            backgroundColor={Color.PRIMARY_7}
            hoverCard={false}
          />
          <Text color={Color.GREY_700}>
            {getString('common.git.currentUserLabel', { user: getUserDisplayName(currentUserInfo) })}
          </Text>
        </Layout.Horizontal>
      ) : (
        <></>
      )}
      {title ? (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'large', top: 'small' }}>
          {title}
        </Text>
      ) : (
        <></>
      )}

      {!loadingCodeManagers && !currentUserInfo && (
        <Layout.Horizontal className={css.addUserContainer} spacing="small">
          <Icon name="warning-sign" color={Color.ORANGE_700}></Icon>
          <div>
            <Text font={{ variation: FontVariation.SMALL }} color={Color.BLACK}>
              {getString('common.git.noUserLabel')}
            </Text>
            <Link to={paths.toUserProfile({ accountId })} target="_blank" onClick={profileLinkClickHandler}>
              <Text inline font={{ variation: FontVariation.SMALL_BOLD }} color={Color.PRIMARY_7}>
                {getString('common.git.addUserCredentialLabel')}
              </Text>
            </Link>
          </div>
        </Layout.Horizontal>
      )}
    </Container>
  )
}

export default SCMCheck
