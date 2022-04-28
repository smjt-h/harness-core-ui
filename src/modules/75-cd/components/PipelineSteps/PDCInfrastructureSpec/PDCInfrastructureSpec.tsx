/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useMemo } from 'react'
import {
  IconName,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Accordion,
  Select
} from '@wings-software/uicore'
import { Radio, RadioGroup } from '@blueprintjs/core'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { debounce, noop, isEmpty } from 'lodash-es'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { PdcInfrastructure, useGetConnectorListV2, ConnectorResponse } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import DelegateSelectorPanel from '@pipeline/components/PipelineSteps/AdvancedSteps/DelegateSelectorPanel/DelegateSelectorPanel'
import SSHSecretInput from '@secrets/components/SSHSecretInput/SSHSecretInput'
import { getNameSpaceSchema, getReleaseNameSchema } from '../PipelineStepsUtil'
import PreviewHostsTable from './PreviewHostsTable/PreviewHostsTable'
import css from './PDCInfrastructureSpec.module.scss'

type PdcInfrastructureTemplate = { [key in keyof PdcInfrastructure]: string }

function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    releaseName: getReleaseNameSchema(getString),
    sshKey: Yup.object().required(getString('validation.password'))
  })
}
interface GcpInfrastructureSpecEditableProps {
  initialValues: PdcInfrastructure
  allValues?: PdcInfrastructure
  onUpdate?: (data: PdcInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: PdcInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: PdcInfrastructure
  allowableTypes: MultiTypeInputType[]
}

interface PDCInfrastructureUI {
  delegateSelectors: any[]
  hostsType: number
  releaseName: string
  hosts: string
  sshKey?: {
    identifier: string
  }
  allowSimultaneousDeployments: boolean
}

const parseHosts = (hosts: string) =>
  hosts
    .replace(/,/g, '\n')
    .split('\n')
    .filter(part => part.length)
    .map(host => host.trim())

const GcpInfrastructureSpecEditable: React.FC<GcpInfrastructureSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const [pdcConnectors, setPdcConnectors] = useState([] as ConnectorResponse[])
  const [hostsType, setHostsType] = useState('0')
  const [hostsScope, setHostsScope] = useState('0')
  const [hostSpecifics, setHostSpecifics] = useState('0')

  const getInitialValues = (): PDCInfrastructureUI => {
    const values: PDCInfrastructureUI = {
      ...initialValues,
      hosts: ''
    }

    return values
  }

  const { mutate: getConnectors } = useGetConnectorListV2({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  useEffect(() => {
    const getPDC = async () => {
      const connectorsResult = await getConnectors({ types: ['Pdc'] })
      setPdcConnectors(connectorsResult.data?.content || [])
    }
    getPDC()
  }, [])

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [])

  const hostSpecificyOptions = useMemo(
    () => [
      { value: '0', label: getString('cd.steps.pdcStep.hostNameOption') },
      { value: '1', label: getString('cd.steps.pdcStep.hostAttributesOption') }
    ],
    []
  )

  return (
    <Layout.Vertical spacing="medium">
      <RadioGroup
        className={css.specifyHostsRadioGroup}
        selectedValue={hostsType}
        onChange={(e: any) => {
          setHostsType(e.target.value)
        }}
      >
        <Radio value={'0'} label={getString('cd.steps.pdcStep.specifyHostsOption')} />
        <Radio value={'1'} label={getString('cd.steps.pdcStep.preconfiguredHostsOption')} />
      </RadioGroup>
      <Formik<PDCInfrastructureUI>
        formName="pdcInfra"
        initialValues={getInitialValues()}
        validationSchema={getValidationSchema(getString)}
        validate={value => {
          const data: Partial<PdcInfrastructure> = {
            releaseName: value.releaseName === '' ? undefined : value.releaseName,
            connectorRef: value.sshKey?.identifier,
            allowSimultaneousDeployments: value.allowSimultaneousDeployments,
            hosts: parseHosts(value.hosts)
          }
          delayedOnUpdate(data)
        }}
        onSubmit={noop}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
          formikRef.current = formik
          return (
            <FormikForm>
              <Layout.Vertical className={css.formRow} spacing="medium" margin={{ bottom: 'large' }}>
                {hostsType == '0' ? (
                  <FormInput.TextArea
                    name="hosts"
                    label={'Hosts'}
                    className={`${css.hostsTextArea} ${css.inputWidth}`}
                    tooltipProps={{
                      dataTooltipId: 'pdcHosts'
                    }}
                  />
                ) : (
                  <Layout.Vertical>
                    <FormInput.Select
                      className={css.inputWidth}
                      items={pdcConnectors.map(pdcConnector => ({
                        label: pdcConnector.connector?.name || '',
                        value: pdcConnector.connector?.identifier || ''
                      }))}
                      label={getString('cd.steps.pdcStep.pdcConnectorLabel')}
                      name="pdcConnector"
                    />
                    <Layout.Horizontal className={css.hostSpecificContainer}>
                      <RadioGroup
                        className={css.specifyHostsRadioGroup}
                        selectedValue={hostsScope}
                        onChange={(e: any) => {
                          setHostsScope(e.target.value)
                        }}
                      >
                        <Radio value={'0'} label={getString('cd.steps.pdcStep.deployAllHostsOption')} />
                        <Radio value={'1'} label={getString('cd.steps.pdcStep.deploySpecificHostsOption')} />
                      </RadioGroup>
                      <Select
                        className={css.hostSelect}
                        value={hostSpecificyOptions.find(option => option.value === hostSpecifics)}
                        onChange={option => {
                          setHostSpecifics(option.value.toString())
                        }}
                        items={hostSpecificyOptions}
                      ></Select>
                    </Layout.Horizontal>
                    <FormInput.TextArea
                      name="hosts"
                      label={'Hosts'}
                      placeholder={getString('cd.steps.pdcStep.hostsPlaceholder')}
                      className={`${css.hostsTextArea} ${css.inputWidth}`}
                      tooltipProps={{
                        dataTooltipId: 'pdcHosts'
                      }}
                    />
                  </Layout.Vertical>
                )}
                <div className={css.inputWidth}>
                  <SSHSecretInput name={'sshKey'} label={getString('cd.steps.common.specifyCredentials')} />
                </div>
                <DelegateSelectorPanel isReadonly={false} formikProps={formik} />
                <PreviewHostsTable
                  hosts={parseHosts(formik.values.hosts)}
                  secretIdentifier={formik.values.sshKey?.identifier}
                />
              </Layout.Vertical>
              <Accordion
                panelClassName={css.accordionPanel}
                detailsClassName={css.accordionDetails}
                activeId={!isEmpty(formik.errors.releaseName) ? 'advanced' : ''}
              >
                <Accordion.Panel
                  id="advanced"
                  addDomId={true}
                  summary={getString('common.advanced')}
                  details={
                    <Layout.Horizontal className={css.formRow} spacing="medium">
                      <FormInput.MultiTextInput
                        name="releaseName"
                        tooltipProps={{
                          dataTooltipId: 'pdcInfraReleasename'
                        }}
                        className={css.inputWidth}
                        label={getString('common.releaseName')}
                        placeholder={getString('cd.steps.common.releaseNamePlaceholder')}
                        multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
                        disabled={readonly}
                      />
                      {getMultiTypeFromValue(formik.values.releaseName) === MultiTypeInputType.RUNTIME && !readonly && (
                        <ConfigureOptions
                          value={formik.values.releaseName as string}
                          type="String"
                          variableName="releaseName"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue('releaseName', value)
                          }}
                          isReadonly={readonly}
                        />
                      )}
                    </Layout.Horizontal>
                  }
                />
              </Accordion>
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }} className={css.lastRow}>
                <FormInput.CheckBox
                  className={css.simultaneousDeployment}
                  tooltipProps={{
                    dataTooltipId: 'pdcInfraAllowSimultaneousDeployments'
                  }}
                  name={'allowSimultaneousDeployments'}
                  label={getString('cd.allowSimultaneousDeployments')}
                  disabled={readonly}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

interface PDCInfrastructureSpecStep extends PdcInfrastructure {
  name?: string
  identifier?: string
}

export class PDCInfrastructureSpec extends PipelineStep<PDCInfrastructureSpecStep> {
  lastFetched: number
  protected type = StepType.PDC
  protected defaultValues: PdcInfrastructure = {
    cluster: '',
    connectorRef: '',
    namespace: '',
    releaseName: '',
    sshKeyRef: ''
  }

  protected stepIcon: IconName = 'pdc'
  protected stepName = 'Specify your PDC Connector'
  protected stepPaletteVisible = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.lastFetched = new Date().getTime()

    this._hasStepVariables = true
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<PdcInfrastructure>): FormikErrors<PdcInfrastructure> {
    const errors: Partial<PdcInfrastructureTemplate> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.connectorRef = getString?.('fieldRequired', { field: getString('connector') })
    }
    if (
      isEmpty(data.cluster) &&
      isRequired &&
      getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME
    ) {
      errors.cluster = getString?.('fieldRequired', { field: getString('common.cluster') })
    }
    /* istanbul ignore else */ if (
      getString &&
      getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME
    ) {
      const namespace = Yup.object().shape({
        namespace: getNameSpaceSchema(getString, isRequired)
      })

      try {
        namespace.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore else */ if (
      getString &&
      getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME
    ) {
      const releaseName = Yup.object().shape({
        releaseName: getReleaseNameSchema(getString, isRequired)
      })

      try {
        releaseName.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    return errors
  }

  renderStep(props: StepProps<PdcInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, customStepProps, readonly, allowableTypes } = props
    return (
      <GcpInfrastructureSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        stepViewType={stepViewType}
        {...(customStepProps as GcpInfrastructureSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
