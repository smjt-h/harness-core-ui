/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo, memoize } from 'lodash-es'
import { Menu } from '@blueprintjs/core'

import { Layout, SelectOption, Text, useToaster } from '@wings-software/uicore'
import type { GetDataError } from 'restful-react'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import type { DockerBuildDetailsDTO, Failure, Error } from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import type { ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import ExperimentalInput from '../../K8sServiceSpecForms/ExperimentalInput'
import { BuildDetailsDTO, getTagError } from '../artifactSourceUtils'
import css from '../../K8sServiceSpec.module.scss'

interface TagsRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
  buildDetailsList?: BuildDetailsDTO
  isFieldDisabled: (fieldName: string, isTag?: boolean) => boolean
  fetchingTags: boolean
  fetchTags: () => Promise<void> | undefined
  fetchTagsError: GetDataError<Failure | Error> | null
  expressions: string[]
}
const ArtifactTagRuntimeField = (props: TagsRenderContent): JSX.Element => {
  const {
    formik,
    path,
    readonly,
    expressions,
    allowableTypes,
    artifactPath,
    isTagsSelectionDisabled,
    buildDetailsList,
    isFieldDisabled,
    fetchingTags,
    fetchTags,
    fetchTagsError,
    stageIdentifier
  } = props
  const { getString } = useStrings()
  const loadingTags = getString('pipeline.artifactsSelection.loadingTags')
  const { showError } = useToaster()

  const [tagsList, setTagsList] = useState<SelectOption[]>([])
  useEffect(() => {
    if (Array.isArray(buildDetailsList)) {
      const toBeSetTagsList = buildDetailsList?.map(({ tag }: DockerBuildDetailsDTO) => ({
        label: defaultTo(tag, ''),
        value: defaultTo(tag, '')
      }))
      if (toBeSetTagsList) {
        setTagsList(toBeSetTagsList)
      }
    }
  }, [buildDetailsList])

  useEffect(() => {
    if (fetchTagsError) {
      showError(`Stage ${stageIdentifier}: ${getTagError(fetchTagsError)}`, undefined, 'cd.tag.fetch.error')
    }
  }, [fetchTagsError, showError, stageIdentifier])

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingTags}
        onClick={handleClick}
      />
    </div>
  ))

  return (
    <ExperimentalInput
      formik={formik}
      disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.tag`, true)}
      selectItems={
        fetchingTags
          ? [
              {
                label: loadingTags,
                value: loadingTags
              }
            ]
          : tagsList
      }
      useValue
      multiTypeInputProps={{
        onFocus: (e: React.ChangeEvent<HTMLInputElement>) => {
          if (
            e?.target?.type !== 'text' ||
            (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
          ) {
            return
          }

          if (!isTagsSelectionDisabled(props)) {
            fetchTags()
          }
        },
        selectProps: {
          items: fetchingTags
            ? [
                {
                  label: loadingTags,
                  value: loadingTags
                }
              ]
            : tagsList,
          usePortal: true,
          addClearBtn: !(readonly || isTagsSelectionDisabled(props)),
          noResults: (
            <Text lineClamp={1}>{getTagError(fetchTagsError) || getString('pipelineSteps.deploy.errors.notags')}</Text>
          ),
          itemRenderer,
          allowCreatingNewItems: true,
          popoverClassName: css.selectPopover
        },
        expressions,
        allowableTypes
      }}
      label={getString('tagLabel')}
      name={`${path}.artifacts.${artifactPath}.spec.tag`}
    />
  )
}

export default ArtifactTagRuntimeField
