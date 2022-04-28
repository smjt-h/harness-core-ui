import React, { useMemo, useCallback, useState } from 'react'
import type { Column } from 'react-table'
import { useParams } from 'react-router-dom'
import { Layout, Table, Button, Label, ButtonSize, ButtonVariation } from '@harness/uicore'
import { useToaster } from '@common/exports'
import { useValidateSshHosts } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import css from '../PDCInfrastructureSpec.module.scss'

interface HostDetails {
  hostname: string
  status?: string
}

interface PreviewHostsTableProps {
  hosts: string[]
  secretIdentifier?: string
}

const PreviewHostsTable = ({ hosts, secretIdentifier }: PreviewHostsTableProps) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const [showPreviewHostBtn, setShowPreviewHostBtn] = useState(true)
  const [detailHosts, setDetailHosts] = useState([] as HostDetails[])

  const { mutate: validateHosts } = useValidateSshHosts({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      identifier: secretIdentifier || ''
    }
  })

  const retryConnection = useCallback(
    async (host: string) => {
      const retryResult = validateHosts([host])
      setDetailHosts(detailHosts.map(hostItem => (hostItem.hostname === '' ? retryResult.data : hostItem)))
    },
    [secretIdentifier]
  )

  const columns: Column<HostDetails>[] = useMemo(
    () => [
      {
        Header: getString('cd.steps.pdcStep.no').toUpperCase(),
        accessor: 'hostname',
        id: 'no',
        width: '10%',
        Cell: ({ row }) => row.index + 1
      },
      {
        Header: getString('pipelineSteps.hostLabel').toUpperCase(),
        accessor: 'hostname',
        id: 'hostname',
        width: '20%',
        Cell: ({ row }) => row.original.hostname
      },
      {
        Header: '',
        accessor: 'status',
        id: 'action',
        width: '70%',
        Cell: ({ row }) =>
          row.original.status === 'failed' ? (
            <Button
              onClick={() => retryConnection(row.original.hostname)}
              size={ButtonSize.SMALL}
              variation={ButtonVariation.SECONDARY}
            >
              {getString('retry')}
            </Button>
          ) : null
      }
    ],
    []
  )

  const refreshHosts = useCallback(() => {
    setDetailHosts(
      hosts.map(host => ({
        hostname: host,
        status: ''
      }))
    )
  }, [hosts])

  const testConnection = useCallback(async () => {
    try {
      const hostResults = await validateHosts(detailHosts.map(host => host.hostname))
      console.log(hostResults)
      const updatedHosts = detailHosts.map(host => host)
      setDetailHosts(updatedHosts)
    } catch (e) {
      showError(e.data.message || e.message)
    }
  }, [detailHosts, secretIdentifier])

  return (
    <Layout.Vertical>
      {showPreviewHostBtn ? (
        <Button
          onClick={() => {
            setShowPreviewHostBtn(false)
            refreshHosts()
          }}
          size={ButtonSize.SMALL}
          variation={ButtonVariation.SECONDARY}
          width={140}
        >
          Preview Hosts
        </Button>
      ) : (
        <>
          <Layout.Horizontal spacing="normal" flex={{ justifyContent: 'space-between' }}>
            <Layout.Horizontal flex={{ alignItems: 'center' }} margin={{ bottom: 'small' }}>
              <Label className={'bp3-label ' + css.previewHostsLabel}>Preview Hosts</Label>
              <Button
                rightIcon="refresh"
                iconProps={{ size: 16 }}
                onClick={refreshHosts}
                size={ButtonSize.SMALL}
                variation={ButtonVariation.SECONDARY}
              >
                {getString('common.refresh')}
              </Button>
            </Layout.Horizontal>
            <Button
              onClick={testConnection}
              size={ButtonSize.SMALL}
              variation={ButtonVariation.SECONDARY}
              disabled={detailHosts.length === 0 || !secretIdentifier}
            >
              {getString('common.smtp.testConnection')}
            </Button>
          </Layout.Horizontal>
          {detailHosts.length > 0 ? (
            <Table columns={columns} data={detailHosts} />
          ) : (
            <Label className={'bp3-label'} style={{ margin: 'auto' }}>
              No hosts provided
            </Label>
          )}
        </>
      )}
    </Layout.Vertical>
  )
}

export default PreviewHostsTable
