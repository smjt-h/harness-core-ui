/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { Link, useParams } from 'react-router-dom'

import { Collapse, Color, Container, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ExecutionNode } from 'services/pipeline-ng'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'

import css from './PolicyEvaluationContent.module.scss'

enum EvaluationStatus {
  ERROR = 'error',
  PASS = 'pass',
  WARNING = 'warning'
}

export function PolicyEvaluationContent({ step }: { step: ExecutionNode }) {
  const { getString } = useStrings()
  const policySetDetails = defaultTo(/* istanbul ignore next */ step?.outcomes?.output?.policySetDetails, {})

  if (isEmpty(policySetDetails)) {
    return <Text margin={{ left: 'large' }}>{getString('common.policiesSets.noPolicySets')}</Text>
  } else {
    const policySetIds = Object.keys(policySetDetails)
    return (
      <Container border={{ top: true }} padding="medium">
        <Text margin={{ left: 'large' }}>{getString('pipeline.policyEvaluations.title')}</Text>
        <Layout.Vertical padding={{ top: 'medium', bottom: 'medium' }}>
          {policySetIds.map(id => {
            return <PolicySetInfo key={id} policySet={policySetDetails[id]} />
          })}
        </Layout.Vertical>
      </Container>
    )
  }
}

function PolicySetInfo({ policySet }: { policySet: { [key: string]: any } }) {
  const { accountId: accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const { name, identifier, status, policyDetails: policies } = policySet

  if (isEmpty(policies)) {
    return <Text margin={{ left: 'large' }}>{getString('common.policy.noPolicyResult')}</Text>
  } else {
    const scope = identifier.includes('account.')
      ? getString('account')
      : identifier.includes('org.')
      ? getString('orgLabel')
      : getString('projectLabel')

    const policyIds = Object.keys(policies)

    return (
      <Container>
        <Collapse
          collapseClassName={css.collapse}
          iconProps={
            {
              color: Color.PRIMARY_7,
              padding: { right: 'small' }
            } as any
          }
          collapsedIcon={'main-chevron-down'}
          expandedIcon={'main-chevron-up'}
          heading={
            <Layout.Horizontal flex={{ alignItems: 'center' }}>
              <Text lineClamp={1} width={'300px'} padding={{ right: 'small' }}>
                <Link
                  to={routes.toGovernancePolicySetsListing({
                    accountId,
                    ...(scope === getString('orgLabel') && { orgIdentifier }),
                    ...(scope === getString('projectLabel') && { projectIdentifier }),
                    module: 'cd'
                  })}
                >
                  {getString('pipeline.policyEvaluations.policySetName', { name })}
                </Link>
              </Text>
              <Text width={'100px'} font={{ size: 'small' }}>
                {scope}
              </Text>
              <ExecutionStatusLabel
                status={
                  status === EvaluationStatus.PASS
                    ? 'Success'
                    : status === EvaluationStatus.ERROR
                    ? 'Errored'
                    : 'InterventionWaiting'
                }
                label={
                  status === EvaluationStatus.PASS
                    ? 'Success'
                    : status === EvaluationStatus.WARNING
                    ? 'Warning'
                    : 'Failed'
                }
              />
            </Layout.Horizontal>
          }
        >
          <Container margin={{ top: 'large' }} border={{ top: true }}>
            {policyIds.map((id, index) => {
              return <PolicyInfo key={id} policy={policies[id]} scope={scope} numberInList={index + 1} />
            })}
          </Container>
        </Collapse>
      </Container>
    )
  }
}

export function PolicyInfo({ policy, scope, numberInList }: { policy: any; scope: string; numberInList: number }) {
  const { accountId: accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const { name: policyName, status, denyMessages, error: errorMessage } = policy
  const statusColor =
    status === EvaluationStatus.PASS ? Color.SUCCESS : status === EvaluationStatus.ERROR ? Color.ERROR : Color.WARNING

  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }} padding={{ top: 'large' }}>
      <Layout.Vertical>
        <Text lineClamp={1} width={'400px'} padding={{ right: 'small' }}>
          <Link
            to={{
              pathname: routes.toGovernancePolicyListing({
                accountId,
                ...(scope === getString('orgLabel') && { orgIdentifier }),
                ...(scope === getString('projectLabel') && { projectIdentifier }),
                module: 'cd'
              })
            }}
          >
            {`Policy ${numberInList}: ${policyName}`}
          </Link>
        </Text>
        <Layout.Vertical>
          {!!denyMessages?.length && (
            <FailureInfo label={getString('details')}>
              {denyMessages.map((message: string, index: number) => (
                <Text key={index} color={statusColor}>
                  {denyMessages?.length > 1 ? '- ' : ''}
                  {message}
                </Text>
              ))}
            </FailureInfo>
          )}
          {errorMessage && (
            <FailureInfo label={getString('error')}>
              <Text key={errorMessage} color={statusColor}>
                {errorMessage}
              </Text>
            </FailureInfo>
          )}
        </Layout.Vertical>
      </Layout.Vertical>
      <ExecutionStatusLabel
        status={
          status === EvaluationStatus.PASS
            ? 'Success'
            : status === EvaluationStatus.ERROR
            ? 'Errored'
            : 'InterventionWaiting'
        }
        label={
          status === EvaluationStatus.PASS ? 'Success' : status === EvaluationStatus.WARNING ? 'Warning' : 'Failed'
        }
      />
    </Layout.Horizontal>
  )
}

function FailureInfo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Layout.Horizontal
      spacing="xsmall"
      padding={{ left: 'xxxlarge', top: 'small' }}
      flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
    >
      <Text color={Color.BLACK}>{label.toUpperCase()}</Text>
      <Container padding={{ left: 'small' }}>{children}</Container>
    </Layout.Horizontal>
  )
}
