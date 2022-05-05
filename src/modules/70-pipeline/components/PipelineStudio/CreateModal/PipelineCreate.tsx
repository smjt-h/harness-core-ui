/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Container,
  Formik,
  FormikForm,
  Button,
  ButtonVariation,
  Text,
  IconName,
  CardSelect,
  Layout,
  Icon
} from '@wings-software/uicore'
import { Color, FontVariation } from '@wings-software/design-system'
import * as Yup from 'yup'
import { noop, omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { useStrings } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import GitContextForm, { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import type { EntityGitDetails } from 'services/pipeline-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, PipelineActions } from '@common/constants/TrackingConstants'
import { getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { DefaultNewPipelineId } from '../PipelineContext/PipelineActions'
import css from './PipelineCreate.module.scss'
import { GitSyncForm } from '@common/components/GitSyncForm/GitSyncForm'

const logger = loggerFor(ModuleName.CD)

interface CardInterface {
  type: string
  title: string
  info: string
  icon: IconName
  disabled?: boolean
}

interface PipelineInfoConfigWithGitDetails extends PipelineInfoConfig {
  repo: string
  branch: string
  connectorRef?: string
  storeType?: string
  importYaml?: string
}
export interface PipelineCreateProps {
  afterSave?: (
    values: PipelineInfoConfig,
    storeMetadata: { connectorRef?: string; storeType?: string },
    gitDetails?: EntityGitDetails,
    usingTemplate?: TemplateSummaryResponse,
    copyingTemplate?: TemplateSummaryResponse
  ) => void
  initialValues?: PipelineInfoConfigWithGitDetails
  closeModal?: () => void
  gitDetails?: IGitContextFormProps
  usingTemplate?: TemplateSummaryResponse
  copyingTemplate?: TemplateSummaryResponse
}

export default function CreatePipelines({
  afterSave,
  initialValues = {
    identifier: '',
    name: '',
    description: '',
    tags: {},
    repo: '',
    branch: '',
    stages: [],
    storeType: 'inline'
  },
  closeModal,
  gitDetails,
  usingTemplate,
  copyingTemplate
}: PipelineCreateProps): JSX.Element {
  const { getString } = useStrings()
  const { pipelineIdentifier } = useParams<{ pipelineIdentifier: string }>()
  const { isGitSyncEnabled } = useAppStore()
  const gitSimplification: boolean = useFeatureFlag(FeatureFlag.GIT_SIMPLIFICATION)
  const [storeType, setStoreType] = useState<CardInterface | undefined>()
  const { trackEvent } = useTelemetry()

  const PipelineModeCards: CardInterface[] = [
    {
      type: 'inline',
      title: 'Inline',
      info: 'Pipeline content is stored in Harness',
      icon: 'repository'
    },
    {
      type: 'remote',
      title: 'Remote',
      info: 'Pipeline content is stored in a Git repository',
      icon: 'pipeline'
    }
  ]

  const identifier = initialValues?.identifier
  if (identifier === DefaultNewPipelineId) {
    initialValues.identifier = ''
  }
  const isEdit = (initialValues?.identifier?.length || '') > 0

  useEffect(() => {
    !isEdit &&
      trackEvent(PipelineActions.LoadCreateNewPipeline, {
        category: Category.PIPELINE
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit])

  return (
    <Container className={css.pipelineCreateForm}>
      <Formik<PipelineInfoConfigWithGitDetails>
        initialValues={initialValues}
        formName="pipelineCreate"
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString('createPipeline.pipelineNameRequired') }),
          identifier: IdentifierSchema(),
          ...(isGitSyncEnabled
            ? {
                repo: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
                branch: Yup.string().trim().required(getString('common.git.validation.branchRequired'))
              }
            : {})
        })}
        onSubmit={values => {
          logger.info(JSON.stringify(values))
          const formGitDetails =
            values.repo && values.repo.trim().length > 0
              ? { repoIdentifier: values.repo, branch: values.branch }
              : undefined
          afterSave &&
            afterSave(
              omit(values, 'repo', 'branch', 'storeType', 'connectorRef'),
              { connectorRef: values.connectorRef, storeType: values.storeType },
              formGitDetails,
              usingTemplate,
              copyingTemplate
            )
        }}
      >
        {formikProps => (
          <FormikForm>
            <NameIdDescriptionTags
              formikProps={formikProps}
              identifierProps={{
                isIdentifierEditable: pipelineIdentifier === DefaultNewPipelineId
              }}
              tooltipProps={{ dataTooltipId: 'pipelineCreate' }}
            />

            {gitSimplification ? (
              <CardSelect
                data={PipelineModeCards}
                cornerSelected={true}
                cardClassName={css.pipelineModeCard}
                renderItem={(item: CardInterface) => (
                  <Layout.Horizontal flex spacing={'small'}>
                    <Icon name={item.icon} />
                    <Container>
                      <Text font={{ variation: FontVariation.FORM_TITLE }}>{item.title}</Text>
                      <Text>{item.info}</Text>
                    </Container>
                  </Layout.Horizontal>
                )}
                selected={storeType}
                onChange={(item: CardInterface) => {
                  formikProps?.setFieldValue('storeType', item.type)
                  formikProps?.setFieldValue('remoteType', item.type === 'remote' ? 'new' : '')
                  setStoreType(item)
                }}
              />
            ) : isGitSyncEnabled ? (
              <GitSyncStoreProvider>
                <GitContextForm formikProps={formikProps} gitDetails={gitDetails} />
              </GitSyncStoreProvider>
            ) : null}

            {storeType?.type === 'remote' ? (
              <GitSyncForm formikProps={formikProps} handleSubmit={noop}></GitSyncForm>
            ) : null}
            {usingTemplate && (
              <Text
                icon={'template-library'}
                margin={{ top: 'medium', bottom: 'medium' }}
                font={{ size: 'small' }}
                iconProps={{ size: 12, margin: { right: 'xsmall' } }}
                color={Color.BLACK}
              >
                {`Using Template: ${getTemplateNameWithLabel(usingTemplate)}`}
              </Text>
            )}
            <Container padding={{ top: 'xlarge' }}>
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={isEdit ? getString('save') : getString('start')}
              />
              &nbsp; &nbsp;
              <Button
                variation={ButtonVariation.TERTIARY}
                text={getString('cancel')}
                onClick={() => {
                  trackEvent(PipelineActions.CancelCreateNewPipeline, {
                    category: Category.PIPELINE
                  })
                  closeModal?.()
                }}
              />
            </Container>
          </FormikForm>
        )}
      </Formik>
    </Container>
  )
}
