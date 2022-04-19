/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { FormGroup, IFormGroupProps, Intent, PopoverInteractionKind } from '@blueprintjs/core'
import {
  Layout,
  Icon,
  Button,
  Text,
  Tag,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormError,
  FormikTooltipContext,
  DataTooltipInterface,
  HarnessDocTooltip,
  ButtonVariation,
  Container,
  Popover,
  useToaster
} from '@wings-software/uicore'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import {
  Failure,
  ConnectorInfoDTO,
  getConnectorListPromise,
  ConnectorConfigDTO,
  GetConnectorListQueryParams,
  ConnectorResponse,
  getConnectorListV2Promise,
  ConnectorFilterProperties,
  useGetConnector,
  EntityGitDetails,
  ResponsePageConnectorResponse,
  getTestConnectionResultPromise
} from 'services/cd-ng'
import {
  EntityReferenceResponse,
  getIdentifierFromValue,
  getScopeFromValue,
  getScopeLabelfromScope
} from '@common/components/EntityReference/EntityReference'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import useCreateConnectorModal, {
  UseCreateConnectorModalReturn
} from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import useCreateConnectorMultiTypeModal from '@connectors/modals/ConnectorModal/useCreateConnectorMultiTypeModal'
import { Scope } from '@common/interfaces/SecretsInterface'
import { String, useStrings, UseStringsReturn } from 'framework/strings'
import { ReferenceSelect, ReferenceSelectProps } from '@common/components/ReferenceSelect/ReferenceSelect'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ResourceScope } from '@rbac/interfaces/ResourceScope'
import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import { DATE_WITHOUT_TIME_FORMAT } from '@common/utils/StringUtils'
import { getReadableDateTime } from '@common/utils/dateUtils'
import { Connectors } from '@connectors/constants'
import { LinkifyText } from '@common/components/LinkifyText/LinkifyText'
import RbacButton from '@rbac/components/Button/Button'
import ConnectorsEmptyState from './connectors-no-data.png'
import css from './ConnectorReferenceField.module.scss'

interface AdditionalParams {
  projectIdentifier?: string
  orgIdentifier?: string
}

const getAdditionalParams = ({
  scope,
  projectIdentifier,
  orgIdentifier
}: {
  scope?: string
  projectIdentifier?: string
  orgIdentifier?: string
}): AdditionalParams => {
  const additionalParams: AdditionalParams = {}

  if (scope === Scope.PROJECT) {
    additionalParams.projectIdentifier = projectIdentifier
  }

  if (scope === Scope.PROJECT || scope === Scope.ORG) {
    additionalParams.orgIdentifier = orgIdentifier
  }

  return additionalParams
}
export interface ConnectorSelectedValue {
  label: string
  value: string
  scope: Scope
  live: boolean
  connector: ConnectorInfoDTO & { gitDetails?: IGitContextFormProps }
}
export interface InlineSelectionInterface {
  selected: boolean
  inlineModalClosed: boolean
}
export interface ConnectorReferenceFieldProps extends Omit<IFormGroupProps, 'label'> {
  accountIdentifier: string
  name: string
  placeholder: string
  label: string | React.ReactElement
  projectIdentifier?: string
  selected?: ConnectorSelectedValue | string
  onChange?: (connector: ConnectorReferenceDTO, scope: Scope) => void
  orgIdentifier?: string
  gitScope?: GitFilterScope
  defaultScope?: Scope
  width?: number
  type?: ConnectorInfoDTO['type'] | ConnectorInfoDTO['type'][]
  category?: GetConnectorListQueryParams['category']
  error?: string
  tooltipProps?: DataTooltipInterface
}

export interface ConnectorReferenceDTO extends ConnectorInfoDTO {
  status: ConnectorResponse['status']
  gitDetails?: EntityGitDetails
  harnessManaged?: boolean
}
export function getEditRenderer(
  selected: ConnectorSelectedValue,
  openConnectorModal: UseCreateConnectorModalReturn['openConnectorModal'],
  type: ConnectorInfoDTO['type'],
  getString: UseStringsReturn['getString'],
  canUpdate = true
): JSX.Element {
  const detailSchema = getConnectorSelectorSchema(selected, getString)
  return (
    <Popover interactionKind={PopoverInteractionKind.CLICK} minimal={true} popoverClassName={css.selectedPopover}>
      <Layout.Horizontal spacing="small" margin={{ left: 'xsmall' }}>
        <Text font={{ variation: FontVariation.FORM_LABEL }}>
          <String stringID="common.selected" />
        </Text>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.PRIMARY_7} className={css.selectedConnector}>
          {selected?.connector?.name}
        </Text>
      </Layout.Horizontal>
      <Container width="367px" padding="large" className={css.detailsContainer}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Layout.Vertical>
            <Text font={{ variation: FontVariation.H6 }} lineClamp={1} width="200px">
              {selected?.connector?.name}
            </Text>
            <Text font={{ variation: FontVariation.BODY }} lineClamp={1} width="200px">
              <String stringID="idLabel" vars={{ id: selected?.connector?.identifier }} />
            </Text>
          </Layout.Vertical>
          {canUpdate ? (
            <Button
              variation={ButtonVariation.SECONDARY}
              text={<String stringID="edit" />}
              onClick={e => {
                e.stopPropagation()
                openConnectorModal(true, type, {
                  connectorInfo: selected?.connector,
                  gitDetails: selected?.connector?.gitDetails
                })
              }}
            />
          ) : (
            <></>
          )}
        </Layout.Horizontal>
        <Layout.Vertical margin={{ top: 'medium', bottom: 'medium' }}>
          {detailSchema.map((item, key) => {
            const borderProp = key ? { border: { top: true } } : {}
            return (
              <Layout.Horizontal height="40px" flex={{ alignItems: 'center' }} key={`${item}${key}`} {...borderProp}>
                <Text font={{ variation: FontVariation.FORM_INPUT_TEXT }} lineClamp={1} width="150px">
                  {item.label}
                </Text>
                <LinkifyText
                  content={item.value}
                  textProps={{
                    color: Color.BLACK,
                    font: { variation: FontVariation.FORM_INPUT_TEXT },
                    lineClamp: 1,
                    width: '177px'
                  }}
                  linkStyles={css.gitUrlStyleInPopover}
                />
              </Layout.Horizontal>
            )
          })}
        </Layout.Vertical>
      </Container>
    </Popover>
  )
}
export function getSelectedRenderer(
  selected: ConnectorSelectedValue,
  status = selected?.live,
  connectorStatusCheckInProgress = false
): JSX.Element {
  const icon = connectorStatusCheckInProgress ? 'spinner' : 'full-circle'
  return (
    <Layout.Horizontal spacing="small" flex={{ distribution: 'space-between' }} className={css.selectWrapper}>
      <Text tooltip={selected?.label} className={css.label} color={Color.GREY_800}>
        {selected?.label}
      </Text>

      <div className={css.rightStatus}>
        <Icon
          className={cx(
            css.status,
            { [css.redStatus]: !connectorStatusCheckInProgress && !status },
            { [css.greenStatus]: !connectorStatusCheckInProgress && status }
          )}
          data-testid={`crf-status`}
          name={icon}
          size={6}
          {...(connectorStatusCheckInProgress && { color: Color.BLUE_500 })}
        />
        <Tag minimal id={css.tag}>
          {getScopeFromValue(selected?.value || '')}
        </Tag>
      </div>
    </Layout.Horizontal>
  )
}

interface GetReferenceFieldMethodProps extends ConnectorReferenceFieldProps {
  getString(key: string, vars?: Record<string, any>): string
  openConnectorModal: UseCreateConnectorModalReturn['openConnectorModal']
  type: ConnectorInfoDTO['type'] | ConnectorInfoDTO['type'][]
  setPagedConnectorData: (data: ResponsePageConnectorResponse) => void
}

interface RecordRenderProps {
  item: EntityReferenceResponse<ConnectorReferenceDTO>
  resourceScope: ResourceScope
  openConnectorModal: GetReferenceFieldMethodProps['openConnectorModal']
  type: ConnectorInfoDTO['type'] | ConnectorInfoDTO['type'][]
  checked?: boolean
  getString(key: string, vars?: Record<string, any>): string
}

const RenderGitHubDetails: React.FC<RecordRenderProps> = props => {
  const { item, getString } = props
  return (
    <Container width={'calc(100% - 150px)'} className={css.gitHubConnectorDetails}>
      <Container>
        <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
          {getString('connectors.connectivityMode.title')}
        </Text>
        <Text
          icon={item.record.spec.executeOnDelegate === false ? 'harness-with-color' : 'delegates-icon'}
          color={Color.GREY_900}
          font={{ variation: FontVariation.SMALL_SEMI }}
        >
          {getString(
            item.record.spec.executeOnDelegate === false ? 'common.harnessPlatform' : 'common.harnessDelegate'
          )}
        </Text>
      </Container>
      <Layout.Vertical className={css.gitUrl} width={'300px'}>
        <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
          {getString('common.gitDetailsTitle')}
        </Text>

        <LinkifyText
          content={item.record.spec.url}
          textProps={{ color: Color.BLACK, font: { variation: FontVariation.SMALL }, lineClamp: 1, width: '122px' }}
          linkStyles={css.gitUrlStyle}
        />
      </Layout.Vertical>
      <Container background={Color.GREEN_50} padding={{ left: 'xsmall', right: 'xsmall' }}>
        <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
          {getString('common.apiStatus')}
        </Text>
        {item.record.spec.apiAccess ? (
          <Text color={Color.GREEN_700} icon="success-tick" font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('enabledLabel')}
          </Text>
        ) : (
          <Text font={{ variation: FontVariation.SMALL_SEMI }}> {getString('common.notEnabled')}</Text>
        )}
      </Container>
    </Container>
  )
}

const RenderConnectorDetails: React.FC<RecordRenderProps> = props => {
  const { item } = props
  switch (item.record.type) {
    case Connectors.GITHUB:
      return <RenderGitHubDetails {...props} />
    case Connectors.KUBERNETES_CLUSTER:
      return <></>
    case Connectors.GITLAB:
      return <></>
    default:
      return <></>
  }
}

const CollapseRecordRender: React.FC<RecordRenderProps> = props => {
  const { item, getString } = props
  return (
    <Layout.Horizontal
      margin={{ left: 'large', right: 'large' }}
      spacing={'large'}
      flex={{ alignItems: 'center' }}
      className={css.connectorDetails}
    >
      <RenderConnectorDetails {...props} />
      {item.record.status?.status !== 'SUCCESS' && item.record.status?.lastConnectedAt !== 0 ? (
        <Container width={'130px'}>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
            {getString('common.lastConnected')}
          </Text>
          <Text color={Color.GREY_900} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getReadableDateTime(item.record.status?.lastConnectedAt, DATE_WITHOUT_TIME_FORMAT)}
          </Text>
        </Container>
      ) : null}
    </Layout.Horizontal>
  )
}

const RecordRender: React.FC<RecordRenderProps> = props => {
  const { item, resourceScope, openConnectorModal, type, checked, getString } = props

  return (
    <Layout.Horizontal margin={{ left: 'small' }} flex={{ distribution: 'space-between' }} className={css.item}>
      <Layout.Horizontal spacing="medium" className={css.leftInfo}>
        <Icon className={cx(css.iconCheck, { [css.iconChecked]: checked })} size={14} name="pipeline-approval" />
        <Icon name={getIconByType(item.record.type)} size={30}></Icon>
        <div className={css.connectorNameId}>
          <Text lineClamp={1} font={{ weight: 'bold' }} color={Color.BLACK}>
            {item.record.name}
          </Text>
          <Text lineClamp={1} font={{ size: 'small', weight: 'light' }} color={Color.GREY_600}>
            {`${getString('common.ID')}: ${item.identifier}`}
          </Text>
        </div>
      </Layout.Horizontal>

      <Layout.Horizontal spacing="small">
        {item.record.gitDetails?.repoIdentifier && (
          <Layout.Horizontal
            flex={{ alignItems: 'center' }}
            spacing="small"
            className={css.gitInfo}
            padding={{ left: 'small', right: 'small' }}
            margin={{ right: 'small' }}
          >
            <Text
              lineClamp={1}
              font={{ size: 'small', weight: 'light' }}
              color={Color.GREY_450}
              icon="repository"
              iconProps={{ size: 12 }}
              className={css.gitDetailMaxWidth}
            >
              {item.record.gitDetails.repoIdentifier}
            </Text>
            <Text
              lineClamp={1}
              font={{ size: 'small', weight: 'light' }}
              color={Color.GREY_450}
              className={cx(css.gitBranchIcon, css.gitDetailMaxWidth)}
              icon="git-new-branch"
              iconProps={{ size: 12 }}
            >
              {item.record.gitDetails.branch}
            </Text>
          </Layout.Horizontal>
        )}
        <Icon
          className={css.status}
          name="full-circle"
          size={10}
          width={30}
          color={item.record.status?.status === 'SUCCESS' ? Color.GREEN_500 : Color.RED_500}
        />

        {!item.record.harnessManaged ? (
          <RbacButton
            minimal
            className={css.editBtn}
            data-testid={`${name}-edit`}
            onClick={e => {
              e.stopPropagation()
              openConnectorModal(true, item.record?.type || type, {
                connectorInfo: item.record,
                gitDetails: { ...item.record?.gitDetails, getDefaultFromOtherRepo: false }
              })
            }}
            permission={{
              permission: PermissionIdentifier.UPDATE_CONNECTOR,
              resource: {
                resourceType: ResourceType.CONNECTOR,
                resourceIdentifier: item.identifier
              },
              resourceScope
            }}
            text={<Icon size={16} name={'Edit'} color={Color.GREY_600} />}
          />
        ) : (
          <></>
        )}
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

export function getReferenceFieldProps({
  defaultScope,
  gitScope,
  accountIdentifier,
  projectIdentifier,
  orgIdentifier,
  type = 'K8sCluster',
  category,
  name,
  width,
  selected,
  placeholder,
  getString,
  openConnectorModal,
  setPagedConnectorData
}: GetReferenceFieldMethodProps): Omit<
  ReferenceSelectProps<ConnectorReferenceDTO>,
  'onChange' | 'onCancel' | 'pagination'
> {
  return {
    name,
    width,
    selectAnReferenceLabel: getString('selectAnExistingConnector'),
    selected: selected as ConnectorSelectedValue,
    placeholder,
    defaultScope,
    createNewLabel: getString('newConnector'),
    // recordClassName: css.listItem,
    isNewConnectorLabelVisible: true,

    fetchRecords: (scope, done, search = '', page = 0) => {
      const additionalParams = getAdditionalParams({ scope, projectIdentifier, orgIdentifier })
      const gitFilterParams =
        gitScope?.repo && gitScope?.branch
          ? {
              repoIdentifier: gitScope.repo,
              branch: gitScope.branch,
              getDefaultFromOtherRepo: gitScope.getDefaultFromOtherRepo ?? true
            }
          : {}
      const request = Array.isArray(type)
        ? getConnectorListV2Promise({
            queryParams: {
              accountIdentifier,
              searchTerm: search,
              ...additionalParams,
              ...gitFilterParams,
              pageIndex: page,
              pageSize: 10
            },
            body: {
              ...(!category && { types: type }),
              category,
              filterType: 'Connector',
              projectIdentifier: scope === Scope.PROJECT ? [projectIdentifier as string] : undefined,
              orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? [orgIdentifier as string] : undefined
            } as ConnectorFilterProperties
          })
        : getConnectorListPromise({
            queryParams: {
              accountIdentifier,
              // If we also pass "type" along with "category", "category" will be ignored
              ...(!category && { type }),
              ...gitFilterParams,
              category,
              searchTerm: search,
              pageIndex: page,
              pageSize: 10,
              projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
              orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined
            }
          })

      return request
        .then(responseData => {
          if (responseData?.data?.content) {
            const connectors = responseData.data.content
            setPagedConnectorData(responseData)
            const response: EntityReferenceResponse<ConnectorReferenceDTO>[] = []
            connectors.forEach(connector => {
              response.push({
                name: connector.connector?.name || '',
                identifier: connector.connector?.identifier || '',
                record: {
                  ...connector.connector,
                  status: connector.status,
                  gitDetails: connector.gitDetails?.objectId ? connector.gitDetails : undefined,
                  harnessManaged: connector.harnessManaged
                } as ConnectorReferenceDTO
              })
            })
            done(response)
          } else {
            done([])
          }
        })
        .catch((err: Failure) => {
          throw err.message
        })
    },
    projectIdentifier,
    orgIdentifier,
    noRecordsText: getString('noConnectorFound'),
    componentName: getString('connector'),
    noDataCard: {
      image: ConnectorsEmptyState,
      message: getString('common.noConnectorAvailable'),
      containerClassName: css.noDataCardContainerConnector,
      className: css.noDataCardContainerContent
    },
    recordRender: function recordRender({ item, selectedScope, selected: checked }) {
      const recordRenderProps: RecordRenderProps = {
        item,
        resourceScope: {
          accountIdentifier,
          orgIdentifier: selectedScope === Scope.ORG || selectedScope === Scope.PROJECT ? orgIdentifier : undefined,
          projectIdentifier: selectedScope === Scope.PROJECT ? projectIdentifier : undefined
        },
        openConnectorModal,
        type,
        checked,
        getString
      }
      return <RecordRender {...recordRenderProps} />
    },
    collapsedRecordRender: function collapsedRecordRender({ item, selectedScope, selected: checked }) {
      const recordRenderProps: RecordRenderProps = {
        item,
        resourceScope: {
          accountIdentifier,
          orgIdentifier: selectedScope === Scope.ORG || selectedScope === Scope.PROJECT ? orgIdentifier : undefined,
          projectIdentifier: selectedScope === Scope.PROJECT ? projectIdentifier : undefined
        },
        openConnectorModal,
        type,
        checked,
        getString
      }
      return <CollapseRecordRender {...recordRenderProps} />
    }
  }
}
export const getConnectorStatusCall = async (
  selected: ConnectorSelectedValue,
  accountIdentifier: string
): Promise<boolean | any> => {
  const connector = selected.connector
  try {
    const { data } = await getTestConnectionResultPromise({
      identifier: connector.identifier,
      queryParams: {
        accountIdentifier: accountIdentifier,
        orgIdentifier: connector.orgIdentifier,
        projectIdentifier: connector.projectIdentifier,
        branch: connector.gitDetails?.branch,
        repoIdentifier: connector.gitDetails?.repoIdentifier
      },
      requestOptions: {
        headers: {
          'content-type': 'application/json'
        }
      },
      body: undefined
    })
    return data?.status === 'SUCCESS'
  } catch (err) {
    return Promise.reject(err)
  }
}

export const ConnectorReferenceField: React.FC<ConnectorReferenceFieldProps> = props => {
  const {
    defaultScope,
    gitScope,
    accountIdentifier,
    projectIdentifier,
    orgIdentifier,
    type = 'K8sCluster',
    name,
    selected,
    label,
    width = 400,
    placeholder,
    category,
    error,
    disabled,
    ...rest
  } = props

  const [pagedConnectorData, setPagedConnectorData] = useState<ResponsePageConnectorResponse>({})
  const [page, setPage] = useState(0)
  const [isConnectorEdited, setIsConnectorEdited] = useState(false)
  const [inlineSelection, setInlineSelection] = React.useState<InlineSelectionInterface>({
    selected: false,
    inlineModalClosed: false
  })
  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: (data?: ConnectorConfigDTO) => {
      if (data) {
        setIsConnectorEdited(true)
        props.onChange?.({ ...data.connector, status: data.status }, Scope.PROJECT)
        setInlineSelection({
          selected: true,
          inlineModalClosed: false
        })
      }
    },
    onClose: () => {
      setInlineSelection(prevState => {
        return { ...prevState, inlineModalClosed: true }
      })
    }
  })

  const { openConnectorMultiTypeModal } = useCreateConnectorMultiTypeModal({
    types: Array.isArray(type) ? type : [type],
    onSuccess: (data?: ConnectorConfigDTO) => {
      if (data) {
        props.onChange?.({ ...data.connector, status: data.status }, Scope.PROJECT)
        setInlineSelection({
          selected: true,
          inlineModalClosed: false
        })
      }
    },
    onClose: () => {
      setInlineSelection(prevState => {
        return { ...prevState, inlineModalClosed: true }
      })
    }
  })

  const [canUpdate] = usePermission(
    {
      resource: {
        resourceType: ResourceType.CONNECTOR
      },
      permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
    },
    []
  )

  const [selectedValue, setSelectedValue] = React.useState(selected)

  const { showError } = useToaster()
  const [connectorStatusCheckInProgress, setConnectorStatusCheckInProgress] = React.useState(false)
  const [connectorStatus, setConnectorStatus] = React.useState(typeof selected !== 'string' && selected?.live)
  const scopeFromSelected = typeof selected === 'string' && getScopeFromValue(selected || '')
  const selectedRef = typeof selected === 'string' && getIdentifierFromValue(selected || '')
  const {
    data: connectorData,
    loading,
    refetch
  } = useGetConnector({
    identifier: selectedRef as string,
    queryParams: {
      accountIdentifier,
      orgIdentifier: scopeFromSelected === Scope.ORG || scopeFromSelected === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: scopeFromSelected === Scope.PROJECT ? projectIdentifier : undefined,
      ...(!isEmpty(gitScope?.repo) && !isEmpty(gitScope?.branch)
        ? {
            branch: gitScope?.branch,
            repoIdentifier: gitScope?.repo,
            getDefaultFromOtherRepo: true
          }
        : {})
    },
    lazy: true
  })
  const getConnectorStatus = (): void => {
    if (typeof selected !== 'string') {
      setConnectorStatusCheckInProgress(true)
      getConnectorStatusCall(selected as ConnectorSelectedValue, accountIdentifier)
        .then(
          status => {
            setConnectorStatus(status)
          },
          err => {
            setConnectorStatus(false)
            showError(err)
          }
        )
        .finally(() => {
          setConnectorStatusCheckInProgress(false)
          setIsConnectorEdited(false)
        })
    }
  }
  React.useEffect(() => {
    if (
      typeof selected == 'string' &&
      getMultiTypeFromValue(selected) === MultiTypeInputType.FIXED &&
      selected.length > 0
    ) {
      refetch()
    } else {
      if (selected && (selected as ConnectorSelectedValue).connector) {
        if (isConnectorEdited) {
          getConnectorStatus()
        } else {
          setConnectorStatus((selected as ConnectorSelectedValue).live)
        }
      }
      setSelectedValue(selected)
    }
  }, [selected, refetch])

  React.useEffect(() => {
    if (
      typeof selected === 'string' &&
      getMultiTypeFromValue(selected) === MultiTypeInputType.FIXED &&
      connectorData &&
      connectorData?.data?.connector?.name &&
      !loading
    ) {
      const scope = getScopeFromValue(selected || '')
      const value = {
        label: connectorData?.data?.connector?.name,
        value:
          scope === Scope.ORG || scope === Scope.ACCOUNT
            ? `${scope}.${connectorData?.data?.connector?.identifier}`
            : connectorData?.data?.connector?.identifier,
        scope: scope,
        live: connectorData?.data?.status?.status === 'SUCCESS',
        connector: connectorData?.data?.connector
      }
      setConnectorStatus(value.live)
      setSelectedValue(value)
    }
  }, [
    connectorData?.data?.connector?.name,
    loading,
    selected,
    defaultScope,
    connectorData,
    connectorData?.data?.connector?.identifier,
    connectorData?.data?.status?.status,
    name
  ])

  const helperText = error ? <FormError name={name} errorMessage={error} /> : undefined
  const intent = error ? Intent.DANGER : Intent.NONE
  const { getString } = useStrings()

  const placeHolderLocal = loading ? getString('loading') : placeholder
  const optionalReferenceSelectProps: Pick<
    ReferenceSelectProps<ConnectorConfigDTO>,
    'createNewHandler' | 'editRenderer'
  > = {}

  if (typeof type === 'string' && !category) {
    optionalReferenceSelectProps.createNewHandler = () => {
      gitScope && (gitScope.getDefaultFromOtherRepo = true)
      openConnectorModal(false, type, {
        gitDetails: { ...gitScope, getDefaultFromOtherRepo: !!gitScope?.getDefaultFromOtherRepo }
      })
    }
  } else if (Array.isArray(type) && !category) {
    optionalReferenceSelectProps.createNewHandler = () => {
      openConnectorMultiTypeModal({
        gitDetails: { ...gitScope, getDefaultFromOtherRepo: !!gitScope?.getDefaultFromOtherRepo }
      })
    }
  }

  const [canUpdateSelectedConnector] = usePermission(
    {
      resource: {
        resourceType: ResourceType.CONNECTOR,
        resourceIdentifier: (selectedValue as ConnectorSelectedValue)?.connector?.identifier || ''
      },
      permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
    },
    []
  )

  if (typeof type === 'string' && typeof selectedValue === 'object' && selectedValue) {
    optionalReferenceSelectProps.editRenderer = getEditRenderer(
      selectedValue as ConnectorSelectedValue,
      openConnectorModal,
      (selectedValue as ConnectorSelectedValue)?.connector?.type || type,
      getString,
      canUpdateSelectedConnector
    )
  } else if (Array.isArray(type) && typeof selectedValue === 'object' && selectedValue) {
    optionalReferenceSelectProps.editRenderer = getEditRenderer(
      selectedValue as ConnectorSelectedValue,
      openConnectorModal,
      (selectedValue as ConnectorSelectedValue)?.connector?.type || type[0],
      getString,
      canUpdateSelectedConnector
    )
  }

  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId =
    props.tooltipProps?.dataTooltipId || (tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : '')

  return (
    <FormGroup
      {...rest}
      label={<HarnessDocTooltip labelText={label} tooltipId={dataTooltipId} />}
      helperText={helperText}
      intent={intent}
    >
      <ReferenceSelect<ConnectorReferenceDTO>
        onChange={(connector, scope) => {
          props.onChange?.(connector, scope)
        }}
        {...getReferenceFieldProps({
          defaultScope,
          gitScope,
          accountIdentifier,
          projectIdentifier,
          orgIdentifier,
          type,
          name,
          selected: selectedValue,
          width,
          placeholder: placeHolderLocal,
          label,
          getString,
          category,
          openConnectorModal,
          setPagedConnectorData
        })}
        hideModal={inlineSelection.selected && inlineSelection.inlineModalClosed}
        isNewConnectorLabelVisible={canUpdate}
        selectedRenderer={getSelectedRenderer(
          selectedValue as ConnectorSelectedValue,
          !!connectorStatus,
          connectorStatusCheckInProgress
        )}
        {...optionalReferenceSelectProps}
        disabled={disabled || loading}
        componentName="Connector"
        noDataCard={{ image: ConnectorsEmptyState }}
        pagination={{
          itemCount: pagedConnectorData?.data?.totalItems || 0,
          pageSize: pagedConnectorData?.data?.pageSize || 10,
          pageCount: pagedConnectorData?.data?.totalPages || -1,
          pageIndex: page || 0,
          gotoPage: pageIndex => setPage(pageIndex)
        }}
        disableCollapse={!(type === 'Github')}
      />
    </FormGroup>
  )
}

function getConnectorSelectorSchema(selected: ConnectorSelectedValue, getString: UseStringsReturn['getString']) {
  const deafultSchema = [
    {
      label: 'Scope',
      value: getScopeLabelfromScope(selected.scope, getString)
    }
  ]
  switch (selected.connector?.type) {
    case Connectors.GITHUB:
      return deafultSchema.concat([
        {
          label: getString('common.gitDetailsTitle'),
          value: selected.connector.spec.url
        },
        {
          label: getString('connectors.connectivityMode.title'),
          value: getString(
            selected.connector.spec.executeOnDelegate === false ? 'common.harnessPlatform' : 'common.harnessDelegate'
          )
        },
        {
          label: getString('common.apiStatus'),
          value: selected.connector.spec.apiAccess ? getString('enabledLabel') : getString('common.notEnabled')
        }
      ])
    case Connectors.KUBERNETES_CLUSTER:
      return deafultSchema
    case Connectors.GITLAB:
      return deafultSchema
    default:
      return deafultSchema
  }
}
