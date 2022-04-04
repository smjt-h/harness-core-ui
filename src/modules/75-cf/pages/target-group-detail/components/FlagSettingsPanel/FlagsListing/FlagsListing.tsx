/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable react/display-name */
import React, { FC, useMemo } from 'react'
import { TableV2 } from '@harness/uicore'
import type { Cell, Column } from 'react-table'
import type { Feature } from 'services/cf'
import { useStrings } from 'framework/strings'
import FlagDetailsCell from './FlagDetailsCell'
import AddFlagCheckboxCell from './AddFlagCheckboxCell'
import VariationsCell from './VariationsCell'

export interface FlagsListingProps {
  flags: Feature[]
  includeAddFlagCheckbox?: boolean
  disableVariationsCell?: (flag: Feature) => boolean
}

const FlagsListing: FC<FlagsListingProps> = ({
  flags,
  includeAddFlagCheckbox = false,
  disableVariationsCell = () => false
}) => {
  const { getString } = useStrings()

  const columns = useMemo<Column<Feature>[]>(() => {
    const cols = [
      {
        Header: getString('cf.segmentDetail.headingFeatureFlag'),
        width: '60%',
        id: 'flag-info',
        Cell: ({ row }: Cell<Feature>) => <FlagDetailsCell flag={row.original} />
      },
      {
        Header: getString('cf.segmentDetail.headingVariation'),
        id: 'variation',
        width: '35%',
        Cell: ({ row }: Cell<Feature>) => (
          <VariationsCell
            flag={row.original}
            fieldPrefix={`flags.${row.original.identifier}`}
            disabled={disableVariationsCell(row.original)}
          />
        )
      }
    ]

    if (includeAddFlagCheckbox) {
      cols.unshift({
        Header: '',
        width: '5%',
        id: 'checked',
        Cell: ({ row }: Cell<Feature>) => (
          <AddFlagCheckboxCell flag={row.original} fieldPrefix={`flags.${row.original.identifier}`} />
        )
      })
    }

    return cols
  }, [disableVariationsCell, includeAddFlagCheckbox])

  return <TableV2<Feature> columns={columns} data={flags} />
}

export default FlagsListing
