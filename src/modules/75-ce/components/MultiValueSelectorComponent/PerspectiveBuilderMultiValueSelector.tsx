/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Icon, Checkbox, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { Virtuoso } from 'react-virtuoso'
import { useStrings } from 'framework/strings'
import type { Maybe } from 'services/ce/services'
import css from './MultiValueSelectorComponent.module.scss'

interface PerspectiveBuilderSelectorComponentProps {
  fetching: boolean
  valueList: Maybe<string>[]
  shouldFetchMore?: boolean
  setSelectedValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  selectedValues: Record<string, boolean>
  fetchMore?: (e: number) => void
  searchText?: string
}

const PerspectiveBuilderSelectorComponent: (props: PerspectiveBuilderSelectorComponentProps) => JSX.Element = ({
  fetching,
  valueList,
  shouldFetchMore,
  setSelectedValues,
  selectedValues,
  fetchMore,
  searchText
}) => {
  const { getString } = useStrings()
  const filteredValues = valueList.filter(val => val) as string[]

  const [isCreateNewHighlighted, setIsCreateNewHighlighted] = useState(true)
  const hoverProps = {
    onMouseEnter: () => setIsCreateNewHighlighted(false),
    onMouseLeave: () => setIsCreateNewHighlighted(true)
  }

  const renderValues = () => {
    const allowToFetchMore = shouldFetchMore

    return (
      <Container>
        <Virtuoso
          style={{ height: 344 }}
          data={filteredValues}
          overscan={{ main: 20, reverse: 20 }}
          endReached={
            /* istanbul ignore next */ e => {
              allowToFetchMore && fetchMore && fetchMore(e)
            }
          }
          initialItemCount={filteredValues.length}
          itemContent={(_, value) => {
            const splitAt = `(${searchText})`
            const re = new RegExp(splitAt, 'g')

            return (
              <Container className={css.multiSelectOption} flex={{ justifyContent: 'flex-start' }} {...hoverProps}>
                <Checkbox
                  inline
                  color={Color.PRIMARY_7}
                  onClick={() => {
                    setSelectedValues(prevVal => ({
                      ...prevVal,
                      [value]: !prevVal[value]
                    }))
                  }}
                  checked={selectedValues[value]}
                  className={cx(css.checkbox, css.labelItem)}
                  key={value}
                  value={value}
                />
                {searchText?.length && filteredValues.indexOf(searchText) === -1 ? (
                  <>
                    <Text color={Color.GREY_700} font={{ variation: FontVariation.SMALL_SEMI }} lineClamp={1}>
                      {value.split(re).map((str, i) => (
                        <Text key={i} inline className={cx({ [css.searchTextHighlight]: str === searchText })}>
                          {str}
                        </Text>
                      ))}
                    </Text>
                  </>
                ) : (
                  <Text inline lineClamp={1} color={Color.GREY_700} font={{ variation: FontVariation.SMALL_SEMI }}>
                    {value}
                  </Text>
                )}
              </Container>
            )
          }}
          components={{
            Footer: function renderFooter() {
              return allowToFetchMore ? (
                <Container padding="small" className={css.fetchingMoreLoader}>
                  <Icon name="spinner" size={20} color="blue500" />
                </Container>
              ) : null
            }
          }}
        />
      </Container>
    )
  }

  const isSelectAllChecked = filteredValues.filter(val => selectedValues[val]).length === filteredValues.length

  return (
    <Container className={cx(css.valueContainer, css.createPerspectiveMvs)}>
      {searchText && searchText?.length > 0 && !filteredValues.includes(searchText) ? (
        <>
          <Container
            className={cx(css.createValueContainer, {
              [css.highlight]: isCreateNewHighlighted
            })}
          >
            <Text inline color={Color.PRIMARY_7}>
              {getString('create')}
            </Text>
            {searchText.split(/,\s*/).map(
              (item, i) =>
                item.length > 0 && (
                  <Text
                    key={i}
                    inline
                    className={css.searchText}
                    color={Color.GREY_500}
                    margin={{ left: 'small' }}
                    rightIcon="cross"
                    rightIconProps={{ color: Color.GREY_500, size: 12 }}
                  >
                    {item}
                  </Text>
                )
            )}
          </Container>
          <Container className={css.separator} />
        </>
      ) : null}

      {filteredValues.length > 0 ? (
        <Container className={css.multiSelectOption} flex={{ justifyContent: 'flex-start' }} {...hoverProps}>
          <Checkbox
            inline
            className={css.checkbox}
            disabled={fetching || !filteredValues.length}
            checked={isSelectAllChecked}
            onChange={() => {
              const selectAllValues: Record<string, boolean> = {}
              filteredValues.forEach(val => {
                if (val) {
                  selectAllValues[val] = !isSelectAllChecked
                }
              })
              setSelectedValues(prevVal => ({
                ...prevVal,
                ...selectAllValues
              }))
            }}
          />
          <Text inline color={Color.GREY_700} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('ce.perspectives.createPerspective.filters.selectAll')}
          </Text>
        </Container>
      ) : null}
      {fetching ? (
        <Container className={css.valueFetching}>
          <Icon name="spinner" size={28} color="blue500" />
        </Container>
      ) : (
        renderValues()
      )}
    </Container>
  )
}

export default PerspectiveBuilderSelectorComponent
