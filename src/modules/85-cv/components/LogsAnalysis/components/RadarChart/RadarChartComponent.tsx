import React from 'react'
import LogAnalysisRadarChart from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/components/LogAnalysisRadarChart'

const chartData = {
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
  ]
}

const RadarChartComponent = (): JSX.Element => {
  return (
    <LogAnalysisRadarChart
      clusterChartData={chartData}
      filteredAngle={{ max: 360, min: 0 }}
      clusterChartLoading={false}
      handleAngleChange={() => null}
      clusterChartError={null}
      logsLoading={false}
      onRadarPointClick={() => null}
      refetchClusterAnalysis={() => null}
      showBaseline={false}
    />
  )
}

export default RadarChartComponent
