import React from 'react'
import Highcharts from 'highcharts'
import AnnotationsFactory from 'highcharts/modules/annotations'

import patternFill from 'highcharts/modules/pattern-fill'

import HighchartsReact from 'highcharts-react-official'
import highchartsMore from 'highcharts/highcharts-more'
import addBoostModule from 'highcharts/modules/boost'
import addBoostCanvastModule from 'highcharts/modules/boost-canvas'
import CEChartOptions from './CEChartOptions'

patternFill(Highcharts)
highchartsMore(Highcharts)
AnnotationsFactory(Highcharts)
addBoostCanvastModule(Highcharts)
addBoostModule(Highcharts)

interface CEChartProps {
  options: Highcharts.Options
}

const CEChart: React.FC<CEChartProps> = ({ options }: CEChartProps) => {
  const opt: Highcharts.Options = Object.assign({}, CEChartOptions, options)
  return <HighchartsReact highcharts={Highcharts} options={opt} />
}

export default CEChart
