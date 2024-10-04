import { ChartInformation, validateChartInformation } from '@lib/chartUtils';
import { useState, useEffect } from 'react';
import { Chart } from 'highcharts';
import { FileTimespan } from '@lib/apiUtils';
import { computeOffsets, getFileTimestamp, getPointIndex, binarySearchClosest} from '@lib/videoUtils';

export const useVideoSyncLines = (
  chartInformation: ChartInformation,
  chartRef: React.RefObject<Chart>,
  videoTimestamp: number,
  videoTimespan: FileTimespan,
  timestamps: number[][]
) => {
  const [offsets, setOffsets] = useState<number[]>([]);
  const [lineX, setLineX] = useState<number>(0);
  const [linePoint, setLinePoint] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [syncedDataPoints, setSyncedDataPoints] = useState<string[]>([]);

  const resetData = () => {
    setOffsets([]);
    setLineX(0);
    setLinePoint({x: 0, y: 0});
    setSyncedDataPoints([]);
  }

  // Do initial calculation when timespan or chartInformation change
  useEffect(() => {
    resetData();
    if (videoTimespan === undefined || !validateChartInformation(chartInformation)) return;
    setOffsets(computeOffsets(chartInformation, videoTimespan));
  }, [videoTimespan, chartInformation]);

  // Updates when video plays
  useEffect(() => {
    if (timestamps.length === 0) return;
    if (chartInformation.hasTimestampX) {
      lineXUpdate(videoTimestamp);
    } else { 
      linePointUpdate(videoTimestamp);
    }
  }, [videoTimestamp]);

  // Calculates the next vertical line 
  const lineXUpdate = (videoTimestamp: number) => {
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
    setSyncedDataPoints(tempValueLines);
  };

  // Calculates the next vertical and horizontal lines
  const linePointUpdate = (videoTimestamp: number) => {
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
    setSyncedDataPoints(tempValueLines);
  };

  return { lineX, linePoint, syncedDataPoints };
}