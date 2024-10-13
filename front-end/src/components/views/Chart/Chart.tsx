import './Chart.css';
import { defaultChartOptions, getChartConfig, movePlotLineX, movePlotLines } from '@lib/chartOptions';
import { LIVE_DATA_INTERVAL, validateChartInformation } from '@lib/chartUtils';
import { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Boost from 'highcharts/modules/boost';
import HighchartsColorAxis from 'highcharts/modules/coloraxis';
import { useResizeDetector } from 'react-resize-detector';
import loadingImg from '@assets/loading.gif';
import { FileTimespan } from '@lib/apiUtils';
import { Chart as ChartType } from 'highcharts';
import { ChartInformation } from '@lib/chartUtils';
import { useChartData } from './useChartData';
import { useVideoSyncLines } from './useVideoSyncLines';
// TODO: Fix this import (Why is it different?) . Currently no ECMA module Womp Womp
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('highcharts-multicolor-series')(Highcharts);

HighchartsColorAxis(Highcharts);
Boost(Highcharts);

interface ChartProps {
  chartInformation: ChartInformation;
  video: FileTimespan;
  videoTimestamp: number;
}

const Chart = ({ chartInformation, video, videoTimestamp }: ChartProps) => {
  const chartRef = useRef<ChartType | null>(null);
  const [chartOptions, setChartOptions] = useState(defaultChartOptions);
  const { parsedData, fileNames, timestamps, minMax, loading, refetch } = useChartData(chartInformation);
  const { lineX, linePoint, syncedDataPoints } = useVideoSyncLines(chartInformation, chartRef, videoTimestamp, video, timestamps);

  useEffect(() => {
    if(!validateChartInformation(chartInformation)) return;

    setChartOptions((prevState) => {
      return {
        ...prevState,
        ...getChartConfig(chartInformation, parsedData, fileNames, minMax.current)
      };
    });
        
  }, [parsedData, fileNames, chartInformation]);

  useEffect(() => {
    if (lineX === 0) return;
    setChartOptions(movePlotLineX(chartOptions, lineX));
  }, [lineX]);

  useEffect(() => {
    if (linePoint.x === 0 && linePoint.y === 0) return;
    setChartOptions(movePlotLines(chartOptions, linePoint.x, linePoint.y));
  }, [linePoint]);

  // This function loops when live is true, and updates the chart every 500ms
  useEffect(() => {
    if(!validateChartInformation(chartInformation)) return;

    let intervalId;

    if (chartInformation.live) {
      intervalId = setInterval(() => {
        refetch();
      }, LIVE_DATA_INTERVAL);
    }

    return () => clearInterval(intervalId);
  }, [chartInformation, refetch]);

  
  const { width, height, ref } = useResizeDetector({
    onResize: () => {
      if (chartRef.current) {
        chartRef.current.setSize(width, height);
      }
    },
    refreshMode: 'debounce',
    refreshRate: 100,
  });

  useEffect(() => {
    // chartRef.current?.axes[0].series[0].points gives only visible points
    // chartRef.current?.axes[0].series[0].options.data is not typescript valid
    console.log(chartRef.current?.series[0].points);

  }, [chartOptions]);

  return (
    <div className="chartContainer" ref={ref}>
      {syncedDataPoints.length > 0 ? (<div className='valueBox'>{syncedDataPoints.join('\n')}</div>) : null}
      <div className='chart'>
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          callback={chart => { chartRef.current = chart; }}
        />
      </div>
      {loading && <img className="loading" src={loadingImg} alt="Loading..." />}
    </div>
  );
};

export default Chart;