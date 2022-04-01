/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable react/display-name */
import React, { FC, useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Cell } from 'react-table'
import type { ObjectSchema } from 'yup'
import * as yup from 'yup'
import {
  Button,
  ButtonVariation,
  Container,
  ExpandingSearchInput,
  Formik,
  FormikForm,
  getErrorInfoFromErrorObject,
  Page,
  Pagination,
  TableV2,
  useToaster
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { Segment, usePatchSegment } from 'services/cf'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import { NoData } from '@cf/components/NoData/NoData'
import imageUrl from '@cf/images/Feature_Flags_Teepee.svg'
import type { FlagSettingsFormData, FlagSettingsFormRow, TargetGroupFlagsMap } from '../../TargetGroupDetailPage.types'
import FlagDetailsCell from './FlagsListing/FlagDetailsCell'
import VariationsCell from './FlagsListing/VariationsCell'
import FlagSettingsFormButtons from './FlagSettingsFormButtons'
import { getFlagSettingsInstructions } from './flagSettingsInstructions'

import css from './FlagSettingsForm.module.scss'

export interface FlagSettingsFormProps {
  targetGroup: Segment
  targetGroupFlagsMap: TargetGroupFlagsMap
  onChange: () => void
  openAddFlagDialog: () => void
}

const FlagSettingsForm: FC<FlagSettingsFormProps> = ({
  targetGroup,
  targetGroupFlagsMap,
  onChange,
  openAddFlagDialog
}) => {
  const { getString } = useStrings()
  const [pageIndex, setPageIndex] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const { showError } = useToaster()

  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()

  const { mutate: patchTargetGroup } = usePatchSegment({
    identifier: targetGroup.identifier,
    queryParams: {
      environmentIdentifier: targetGroup.environment as string,
      projectIdentifier,
      accountIdentifier,
      orgIdentifier
    }
  })

  const onSubmit = useCallback(
    async (values: FlagSettingsFormData) => {
      if (!submitting) {
        setSubmitting(true)

        const instructions = getFlagSettingsInstructions(values.flags, targetGroupFlagsMap)

        try {
          await patchTargetGroup({ instructions })
          onChange()
        } catch (e) {
          showError(getErrorInfoFromErrorObject(e))
        }

        setSubmitting(false)
      }
    },
    [patchTargetGroup, onChange, showError, submitting, targetGroupFlagsMap]
  )

  const initialValues = useMemo<FlagSettingsFormData>(
    () => ({
      flags: Object.values(targetGroupFlagsMap).reduce<FlagSettingsFormData['flags']>(
        (rows, { identifier, variation }) => ({
          ...rows,
          [identifier]: { identifier, variation }
        }),
        {}
      )
    }),
    [targetGroupFlagsMap]
  )

  const validationSchema = useMemo(
    () =>
      yup.object({
        flags: yup.lazy(obj =>
          yup
            .object()
            .shape(
              Object.keys(obj as FlagSettingsFormData['flags']).reduce<Record<string, ObjectSchema>>(
                (objShape, key) => ({
                  ...objShape,
                  [key]: yup.object({
                    variation: yup.string().trim().required(getString('cf.segmentDetail.variationIsRequired'))
                  })
                }),
                {}
              )
            )
            .required()
        )
      }),
    []
  )

  return (
    <Formik<FlagSettingsFormData>
      onSubmit={values => {
        onSubmit(values)
      }}
      formName="FlagSettingsForm"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ values, dirty, resetForm, submitForm, setFieldValue }) => {
        const startIndex = CF_DEFAULT_PAGE_SIZE * pageIndex

        const filteredFlags = !searchTerm
          ? Object.values(values.flags)
          : Object.values(values.flags).filter(flag =>
              (targetGroupFlagsMap[flag.identifier].flag?.name ?? '')
                .toLocaleLowerCase()
                .includes(searchTerm.toLocaleLowerCase())
            )

        const pagedFlags = filteredFlags.slice(startIndex, startIndex + CF_DEFAULT_PAGE_SIZE)

        return (
          <>
            <Page.SubHeader>
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('cf.segmentDetail.addFlag')}
                onClick={openAddFlagDialog}
              />
              <ExpandingSearchInput alwaysExpanded name="flag-search" onChange={text => setSearchTerm(text)} />
            </Page.SubHeader>

            <FormikForm className={css.formLayout} disabled={submitting}>
              {(!searchTerm || filteredFlags.length > 0) && (
                <Container padding="xlarge">
                  <TableV2<FlagSettingsFormRow>
                    data={pagedFlags}
                    columns={[
                      {
                        Header: getString('cf.segmentDetail.headingFeatureFlag'),
                        id: 'flagDetails',
                        width: '60%',
                        Cell: ({ row }: Cell<FlagSettingsFormRow>) => (
                          <FlagDetailsCell flag={targetGroupFlagsMap[row.original.identifier].flag} />
                        )
                      },
                      {
                        Header: getString('cf.segmentDetail.headingVariation'),
                        id: 'variation',
                        width: '35%',
                        Cell: ({ row }: Cell<FlagSettingsFormRow>) => (
                          <VariationsCell
                            flag={targetGroupFlagsMap[row.original.identifier].flag}
                            fieldPrefix={`flags.${row.original.identifier}`}
                          />
                        )
                      },
                      {
                        Header: '',
                        id: 'actions',
                        width: '5%',
                        Cell: ({ row }: Cell<FlagSettingsFormRow>) => (
                          <div className={css.alignRight}>
                            <Button
                              icon="trash"
                              variation={ButtonVariation.ICON}
                              aria-label={getString('cf.segmentDetail.removeRule')}
                              onClick={e => {
                                e.preventDefault()
                                setFieldValue(`flags.${row.original.identifier}`, undefined)
                              }}
                            />
                          </div>
                        )
                      }
                    ]}
                  />
                </Container>
              )}
              {filteredFlags.length === 0 && searchTerm && (
                <Container width="100%" height="100%" flex={{ align: 'center-center' }}>
                  <NoData imageURL={imageUrl} message={getString('cf.noResultMatch')} />
                </Container>
              )}

              {filteredFlags.length > 0 && (
                <Container padding={{ left: 'xlarge', right: 'xlarge' }} data-testid="flags-pagination">
                  <Pagination
                    pageSize={CF_DEFAULT_PAGE_SIZE}
                    pageCount={Math.ceil(filteredFlags.length / CF_DEFAULT_PAGE_SIZE)}
                    itemCount={filteredFlags.length}
                    pageIndex={pageIndex}
                    gotoPage={page => setPageIndex(page)}
                  />
                </Container>
              )}

              {dirty && <FlagSettingsFormButtons submitting={submitting} onCancel={resetForm} onSubmit={submitForm} />}
            </FormikForm>
          </>
        )
      }}
    </Formik>
  )
}

export default FlagSettingsForm
