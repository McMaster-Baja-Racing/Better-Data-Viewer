import styles from './Chart.module.scss';
import { defaultChartOptions, getChartConfig, movePlotLineX, movePlotLines } from '@lib/chartOptions';
import { LIVE_DATA_INTERVAL, validateChartInformation } from '@lib/chartUtils';
import { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Boost from 'highcharts/modules/boost';
import HighchartsColorAxis from 'highcharts/modules/coloraxis';
import { useResizeDetector } from 'react-resize-detector';
import loadingImg from '@assets/loading.gif';
import { FileTimespan, ChartInformation } from '@types';
import { Chart as ChartType } from 'highcharts';
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
  const { lineX, linePoint, syncedDataPoints } = useVideoSyncLines(
    chartInformation, 
    chartRef.current, 
    videoTimestamp, 
    video,
    timestamps
  );

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

  // TODO: Use it or lose it
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const handleWindowResize = () => {
      if (chartRef.current) {
        chartRef.current.reflow();
      }
    };
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return (
    <div className={styles.chartContainer}>
      {syncedDataPoints.length > 0 ? (<div className={styles.valueBox}>{syncedDataPoints.join('\n')}</div>) : null}
      <div className={styles.chart} style={{ height: '100%', width: '100%' }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          callback={(chart: ChartType) => { chartRef.current = chart; }}
          containerProps={{ style: { height: '100%', width: '100%' } }}  
        />
      </div>
      {loading && <img className={styles.loading} src={loadingImg} alt="Loading..." />}
    </div>
  );
};

export default Chart;