import React from 'react'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'

const BillingPage: React.FC = ({ children }) => {
  const { getString } = useStrings()

  return (
    <>
      <Page.Header breadcrumbs={<NGBreadcrumbs />} title={getString('common.subscriptions.tabs.billing.billing')} />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default BillingPage
