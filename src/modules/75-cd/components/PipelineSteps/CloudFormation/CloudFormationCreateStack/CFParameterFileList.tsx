/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useCallback, DragEvent, useContext, ReactElement } from 'react'
import cx from 'classnames'
import {
  Layout,
  Text,
  Button,
  Icon,
  Color,
  Label,
  FormikTooltipContext,
  ButtonVariation,
  MultiTypeInputType
} from '@harness/uicore'
import { Classes, MenuItem, Popover, PopoverInteractionKind, Menu } from '@blueprintjs/core'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import type { FormikProps } from 'formik'
import { onDragEnd, onDragLeave, onDragOver, onDragStart } from '@pipeline/components/InputSetSelector/utils'
import { useStrings } from 'framework/strings'
import { InlineParameterFile } from './InlineParameterFile'

import css from '../CloudFormation.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface TfVarFileProps {
  formik: FormikProps<any>
  isReadonly?: boolean
  allowableTypes: MultiTypeInputType[]
  getNewConnectorSteps?: any
  setSelectedConnector?: any
  selectedConnector?: string
}

export default function CFParamFileList({ formik, isReadonly = false, allowableTypes }: TfVarFileProps): ReactElement {
  const [showTfModal, setShowTfModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedVar, setSelectedVar] = useState()
  const [selectedVarIndex, setSelectedVarIndex] = useState<number>(0)
  const { getString } = useStrings()

  const inlineRender = (paramFile: any, index: number): ReactElement => {
    const inlineVar = paramFile
    return (
      <div className={css.configField}>
        <Layout.Horizontal>
          {inlineVar?.type === getString('inline') && <Icon name="Inline" className={css.iconPosition} />}
          <Text>{inlineVar?.identifier}</Text>
        </Layout.Horizontal>
        <Icon
          name="edit"
          onClick={() => {
            setShowTfModal(true)
            setIsEditMode(true)
            setSelectedVarIndex(index)
            setSelectedVar(paramFile)
          }}
        />
      </div>
    )
  }
  const onDrop = useCallback(
    (event: DragEvent<HTMLLIElement>, arrayHelpers: FieldArrayRenderProps, droppedIndex: number) => {
      if (event.preventDefault) {
        event.preventDefault()
      }
      const data = event.dataTransfer.getData('data')
      if (data) {
        const index = parseInt(data, 10)
        arrayHelpers.swap(index, droppedIndex)
      }
      event.currentTarget.classList.remove(css.dragOver)
    },
    []
  )

  const onCloseOfInlineVarForm = () => {
    setShowTfModal(false)
    setIsEditMode(false)
    setSelectedVar(undefined)
  }
  const tooltipContext = useContext(FormikTooltipContext)
  const dataTooltipId = tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : ''
  return (
    <Layout.Vertical>
      <Label style={{ color: Color.GREY_900 }} className={css.tfVarLabel} data-tooltip-id={dataTooltipId}>
        {getString('optionalField', { name: getString('cd.cloudFormation.cfParameterFiles') })}
      </Label>
      <div className={cx(stepCss.formGroup, css.tfVarMargin)}>
        <FieldArray
          name="parameterFiles"
          render={arrayHelpers => {
            window.console.log(formik.values)
            const paramFiles = formik.values?.parameterFiles
            return (
              <>
                {paramFiles?.map((varFile: any, i: number) => {
                  return (
                    <Layout.Horizontal
                      className={css.addMarginTop}
                      key={`${varFile?.varFile?.spec?.type}`}
                      flex={{ distribution: 'space-between' }}
                      style={{ alignItems: 'end' }}
                    >
                      <li
                        style={{ alignItems: 'baseline' }}
                        key={varFile?.varFile?.spec?.type}
                        draggable={true}
                        onDragEnd={onDragEnd}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDragStart={event => onDragStart(event, varFile)}
                        onDrop={event => onDrop(event, arrayHelpers, i)}
                      >
                        <Icon name="drag-handle-vertical" className={css.drag} />
                        {(paramFiles || [])?.length > 1 && <Text color={Color.BLACK}>{`${i + 1}.`}</Text>}
                        {varFile?.varFile?.type === 'Inline' && inlineRender(varFile, i)}
                        <Button
                          minimal
                          icon="main-trash"
                          data-testid={`remove-tfvar-file-${i}`}
                          onClick={() => arrayHelpers.remove(i)}
                        />
                      </li>
                    </Layout.Horizontal>
                  )
                })}
                <Popover
                  interactionKind={PopoverInteractionKind.CLICK}
                  boundary="viewport"
                  popoverClassName={Classes.DARK}
                  content={
                    <Menu>
                      <MenuItem
                        text={<Text intent="primary">{getString('cd.addInline')} </Text>}
                        icon={<Icon name="Inline" className={css.iconMargin} />}
                        onClick={() => setShowTfModal(true)}
                      />
                    </Menu>
                  }
                >
                  <Button variation={ButtonVariation.LINK} data-testid="add-tfvar-file" className={css.addTfVarFile}>
                    {getString('plusAdd')}
                  </Button>
                </Popover>
                {showTfModal && (
                  <InlineParameterFile
                    arrayHelpers={arrayHelpers}
                    isEditMode={isEditMode}
                    selectedVarIndex={selectedVarIndex}
                    showTfModal={showTfModal}
                    selectedVar={selectedVar}
                    onClose={onCloseOfInlineVarForm}
                    onSubmit={onCloseOfInlineVarForm}
                    isReadonly={isReadonly}
                    allowableTypes={allowableTypes}
                  />
                )}
              </>
            )
          }}
        />
      </div>
    </Layout.Vertical>
  )
}
