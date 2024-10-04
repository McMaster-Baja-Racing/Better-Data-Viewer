import './Chart.css';
import { defaultChartOptions, getChartConfig, movePlotLineX, movePlotLines } from '@lib/chartOptions';
import { LIVE_DATA_INTERVAL, validateChartInformation } from '@lib/chartUtils';
import { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Boost from 'highcharts/modules/boost';
import HighchartsColorAxis from 'highcharts/modules/coloraxis';
import { computeOffsets, getFileTimestamp, getPointIndex, binarySearchClosest} from '@lib/videoUtils';
import { useResizeDetector } from 'react-resize-detector';
import loadingImg from '@assets/loading.gif';
import { FileTimespan } from '@lib/apiUtils';
import { Chart as ChartType } from 'highcharts';
import { chartInformation } from '@lib/chartUtils';
import { useChartData } from './useChartData';
// TODO: Fix this import (Why is it different?) . Currently no ECMA module Womp Womp
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('highcharts-multicolor-series')(Highcharts);

HighchartsColorAxis(Highcharts);
Boost(Highcharts);

interface ChartProps {
  chartInformation: chartInformation;
  video: FileTimespan;
  videoTimestamp: number;
}

const Chart = ({ chartInformation, video, videoTimestamp }: ChartProps) => {

  const { parsedData, fileNames, timestamps, minMax, loading, refetch } = useChartData(chartInformation);
  const [chartOptions, setChartOptions] = useState(defaultChartOptions);
  const [offsets, setOffsets] = useState([]);
  const [lineX, setLineX] = useState(0);
  const [linePoint, setLinePoint] = useState({x: 0, y: 0});
  const [valueLines, setValueLines] = useState<string[]>([]);

  // Once necessary data is fetched, format it for the chart
  useEffect(() => {
    if(!validateChartInformation(chartInformation)) return;

    // Update the chart options with the new data
    setChartOptions((prevState) => {
      return {
        ...prevState,
        ...getChartConfig(chartInformation, parsedData, fileNames, minMax.current)
      };
    });
        
  }, [parsedData, fileNames, chartInformation]);

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

  const chartRef = useRef<ChartType | null>(null);
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
    if (video.key === '' || chartInformation === undefined) return;
    setOffsets(computeOffsets(chartInformation, video));
  }, [chartInformation, video]);

  // Handles updating the chart when the video timestamp changes
  useEffect(() => {
    if (timestamps.length === 0) return;
    if (chartInformation.hasTimestampX) lineXUpdate(videoTimestamp);
    else linePointUpdate(videoTimestamp);
  }, [videoTimestamp, offsets, timestamps]);

  useEffect(() => {
    if (lineX === 0) return;
    setChartOptions(movePlotLineX(chartOptions, lineX));
  }, [lineX]);

  useEffect(() => {
    if (linePoint.x === 0 && linePoint.y === 0) return;
    setChartOptions(movePlotLines(chartOptions, linePoint.x, linePoint.y));
  }, [linePoint]);

  // Reset the value box when chartInformation changes
  useEffect(() => {
    setValueLines([]);
  }, [chartInformation]);

  // Calculates and updates which value is closest to the video timestamp for each series
  const lineXUpdate = (videoTimestamp) => {
    if (chartRef.current === null || chartRef.current.series.length === 0) return;

    // TODO: Find a better base value for fileTimestamp
    let fileTimestamp = -Infinity;
  
    const visibleSeries = chartRef.current.series.filter(series => series.visible);
    if (visibleSeries.length === 0) return;

    // Gets the first file timestamp that is not undefined
    visibleSeries.some(series => {
      if (chartRef.current === null) return;
      const seriesIndex = chartRef.current.series.indexOf(series);
      fileTimestamp = getFileTimestamp(videoTimestamp, offsets[seriesIndex], timestamps[seriesIndex]);
      return fileTimestamp !== undefined;
    });
    
    // Updates the lineX value with the new file timestamp
    const newLineX = Math.floor(fileTimestamp);
    if (fileTimestamp !== undefined) setLineX(newLineX); else return;
    
    // Finds the closest value to the new lineX value for each series
    // Skips the series whose x values do not contain the new lineX value in their domain
    const values = visibleSeries.flatMap(series => {
      if (newLineX < series.xData[0] || newLineX > series.xData[series.xData.length - 1]) return [];
      const closestXIndex = binarySearchClosest(series.xData, newLineX);
      return [{ name: series.name, y: series.yData[closestXIndex] }];
    });

    // Updates the value box with the found values
    const tempValueLines = ['Timestamp: ' + new Date(newLineX).toUTCString()];
    chartRef.current.series.forEach(series => {
      const value = values.find(value => value.name === series.name);
      if (value === undefined) return;
      tempValueLines.push(`${series.name}: ${value.y}`);
    });
    setValueLines(tempValueLines);
  };

  // Calculates and updates which point is closest to the video timestamp for each series
  const linePointUpdate = (videoTimestamp) => {
    // Finds the matching point index for the first visible series using the video timestamp
    if (chartRef.current === null || chartRef.current.series.length === 0) return;
    //TODO: Update this null check to be inline and return the right case
    const visibleSeries = chartRef.current.series.filter(series => series.visible);
    if (visibleSeries.length === 0) return;
    const firstVisibleSeries = visibleSeries[0];
    const seriesIndex = chartRef.current.series.indexOf(firstVisibleSeries);
    const pointIndex = getPointIndex(
      firstVisibleSeries,
      videoTimestamp,
      offsets[seriesIndex],
      timestamps[seriesIndex]
    );

    if (pointIndex >= 0) {
      setLinePoint({x: firstVisibleSeries.xData[pointIndex], y: firstVisibleSeries.yData[pointIndex]});
    } else return;

    // Finds the point index for all the other visible series
    const values = [
      { 
        name: firstVisibleSeries.name,
        x: firstVisibleSeries.xData[pointIndex], 
        y: firstVisibleSeries.yData[pointIndex] 
      }, ...visibleSeries.slice(1).map(series => {
        if (chartRef.current === null || chartRef.current.series.length === 0) throw new Error('Chart is not initialized');
        const seriesIndex = chartRef.current.series.indexOf(series);
        const pointIndex = getPointIndex(
          series,
          videoTimestamp,
          offsets[seriesIndex],
          timestamps[seriesIndex]
        );
        if (pointIndex >= 0) {
          return {name: series.name, x: series.xData[pointIndex], y: series.yData[pointIndex]};
        }
      })
    ];

    // Updates the value box with the found values
    const tempValueLines: string[] = [];
    chartRef.current.series.forEach(series => {
      const value = values.find(value => value.name === series.name);
      if (value === undefined) return;
      tempValueLines.push(`${series.name}: (${value.x.toFixed(5)}, ${value.y.toFixed(5)})`);
    });
    setValueLines(tempValueLines);
  };

  return (
    <div className="chartContainer" ref={ref}>
      {valueLines.length > 0 ? (<div className='valueBox'>{valueLines.join('\n')}</div>) : null}
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