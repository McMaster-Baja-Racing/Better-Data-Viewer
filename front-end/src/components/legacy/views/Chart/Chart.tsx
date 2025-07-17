import styles from './Chart.module.scss';
import { movePlotLineX, movePlotLines } from '@lib/chartOptions';
import { LIVE_DATA_INTERVAL } from '@lib/chartUtils';
import { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Boost from 'highcharts/modules/boost';
import HighchartsColorAxis from 'highcharts/modules/coloraxis';
import loadingImg from '@assets/loading.gif';
import { FileTimespan } from '@types';
import { Chart as ChartType } from 'highcharts';
// import { useChartData } from './useChartData';
import { useChartData } from './useChartData';
import { useVideoSyncLines } from './useVideoSyncLines';
import { useChartOptions } from '../../../../ChartOptionsContext';
import { useChartQuery } from '../../../../ChartQueryContext';
import { useDashboard } from '../../../../DashboardContext';

// TODO: Fix this import (Why is it different?) . Currently no ECMA module Womp Womp
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('highcharts-multicolor-series')(Highcharts);

HighchartsColorAxis(Highcharts);
Boost(Highcharts);

interface ChartProps {
  video: FileTimespan;
  videoTimestamp: number;
}

const Chart = ({ video, videoTimestamp }: ChartProps) => {
  const chartRef = useRef<ChartType | null>(null);
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();
  const { series } = useChartQuery();
  const { live } = useDashboard();
  const { timestamps, loading, refetch } = useChartData();
  const { lineX, lineY, syncedDataPoints } = useVideoSyncLines(
    chartRef.current, 
    videoTimestamp, 
    video,
    timestamps
  );

  useEffect(() => {
    // TODO: Don't just use the first series for axis titles
    chartOptionsDispatch({
      type: 'SET_AXIS_TITLE',
      axis: 'xAxis',
      title: series[0]?.x.header
    });
    chartOptionsDispatch({
      type: 'SET_AXIS_TITLE',
      axis: 'yAxis',
      title: series[0]?.y.header
    });
  }, [series]);

  // Update line
  useEffect(() => {
    if (lineX === 0) return;
    chartOptionsDispatch({
      type: 'REPLACE_OPTIONS',
      options: movePlotLineX(options, lineX)
    });
  }, [lineX]);

  // // Update lines
  useEffect(() => {
    if (lineX === 0 && lineY === 0) return;
    chartOptionsDispatch({
      type: 'REPLACE_OPTIONS',
      options: movePlotLines(options, lineX, lineY)
    });
  }, [lineX, lineY]);

  // This function loops when live is true, and updates the chart every 500ms
  useEffect(() => {
    let intervalId;

    if (live) {
      intervalId = setInterval(() => {
        refetch();
      }, LIVE_DATA_INTERVAL);
    }

    return () => clearInterval(intervalId);
  }, [refetch]);

  return (
    <div className={styles.chartContainer}>
      {/* {syncedDataPoints.length > 0 ? (<div className={styles.valueBox}>{syncedDataPoints.join('\n')}</div>) : null} */}
      <div className={styles.chart} style={{ height: '100%', width: '100%' }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          callback={(chart: ChartType) => { chartRef.current = chart; }}
          containerProps={{ style: { height: '100%', width: '100%' } }}  
        />
      </div>
      {loading && <img className={styles.loading} src={loadingImg} alt="Loading..." />}
    </div>
  );
};

export default Chart;