import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { LogAnalysisRadarChartProps } from '../LogAnalysisRadarChart.types'
import LogAnalysisRadarChart from '../LogAnalysisRadarChart'

const WrappedComponent = (props: LogAnalysisRadarChartProps): JSX.Element => {
  return (
    <TestWrapper>
      <LogAnalysisRadarChart {...props} />
    </TestWrapper>
  )
}

const handleAngleChangeMockFn = jest.fn()

const initialProps: LogAnalysisRadarChartProps = {
  clusterChartData: {
    metaData: {},
    resource: [
      {
        label: 0,
        message: 'projects/chi-play/logs/stdout',
        risk: 'HEALTHY',
        radius: 1.357564536113864,
        angle: 0,
        baseline: {
          label: 0,
          message: 'projects/chi-play/logs/stdout',
          risk: 'NO_ANALYSIS',
          radius: 0.5,
          angle: 0,
          clusterType: 'BASELINE',
          hasControlData: false
        },
        clusterType: 'KNOWN_EVENT',
        hasControlData: true
      },
      {
        label: 2,
        message: 'projects/chi-play/logs/stderr',
        risk: 'HEALTHY',
        radius: 1.8066135269309567,
        angle: 120,
        baseline: {
          label: 2,
          message: 'projects/chi-play/logs/stderr',
          risk: 'NO_ANALYSIS',
          radius: 0.2,
          angle: 120,
          clusterType: 'BASELINE',
          hasControlData: false
        },
        clusterType: 'KNOWN_EVENT',
        hasControlData: true
      },
      {
        label: 1,
        message: 'projects/chi-play/logs/events',
        risk: 'HEALTHY',
        radius: 1.480099986754282,
        angle: 240,
        baseline: {
          label: 1,
          message: 'projects/chi-play/logs/events',
          risk: 'NO_ANALYSIS',
          radius: 0.3698184595475662,
          angle: 240,
          clusterType: 'BASELINE',
          hasControlData: false
        },
        clusterType: 'KNOWN_EVENT',
        hasControlData: true
      }
    ],
    responseMessages: []
  },
  handleAngleChange: handleAngleChangeMockFn,
  filteredAngle: { max: 360, min: 0 },
  clusterChartLoading: false,
  onRadarPointClick: jest.fn()
}

describe('LogAnalysisRadarChart', () => {
  test('should render loading UI, if the API is loading', () => {
    render(<WrappedComponent {...initialProps} clusterChartLoading />)

    expect(screen.getByTestId('RadarChart_loading')).toBeInTheDocument()
  })

  test('should render No data UI, if the no data to render the chart', () => {
    render(<WrappedComponent {...initialProps} clusterChartData={{ resource: [] }} />)

    expect(screen.getByTestId('RadarChart_noData')).toBeInTheDocument()
  })

  test('should correct data in chart all required data is present', () => {
    const { container } = render(<WrappedComponent {...initialProps} />)

    expect(container.querySelector('.highcharts-root')).toBeInTheDocument()
    expect(container.querySelectorAll('.highcharts-scatter-series')).toHaveLength(6)
  })
})
