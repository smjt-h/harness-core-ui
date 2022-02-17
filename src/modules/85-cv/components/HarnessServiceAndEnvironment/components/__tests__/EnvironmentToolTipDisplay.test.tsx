import React from 'react'
import { render, findByText } from '@testing-library/react'
import { Color } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ChangeSourceCategoryName } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import { EnvironmentToolTipDisplay, ToolTipProps } from '../EnvironmentToolTipDisplay'

const Wrapper = (props: ToolTipProps): JSX.Element => {
  return (
    <TestWrapper>
      <EnvironmentToolTipDisplay {...props} />
    </TestWrapper>
  )
}

describe('EnvironmentSelectOrCreate', () => {
  test('Should render ToolTip Display component', async () => {
    const { container } = render(
      <Wrapper
        color={Color.AQUA_500}
        font={''}
        type={ChangeSourceCategoryName.INFRASTRUCTURE}
        envRefList={['env']}
        shouldAddEnvPrefix
      />
    )

    const ele = await findByText(container, 'environment: env')

    expect(ele).toBeInTheDocument()
  })

  test('Should render ToolTip Display component with shouldAddEnvPrefix as false', async () => {
    const { container } = render(
      <Wrapper
        color={Color.AQUA_500}
        font={''}
        type={ChangeSourceCategoryName.INFRASTRUCTURE}
        envRefList={['env']}
        shouldAddEnvPrefix={false}
      />
    )

    const ele = await findByText(container, 'env')

    expect(ele).toBeInTheDocument()
  })

  test('If not Infrastructure then it should render the data from envRef', async () => {
    const { container } = render(
      <Wrapper
        color={Color.AQUA_500}
        font={''}
        type={ChangeSourceCategoryName.ALERT}
        environmentRef={'env'}
        shouldAddEnvPrefix
      />
    )

    const ele = await findByText(container, 'environment: env')

    expect(ele).toBeInTheDocument()
  })
})
