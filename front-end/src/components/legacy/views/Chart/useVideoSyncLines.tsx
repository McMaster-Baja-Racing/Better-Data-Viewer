import { useState, useEffect } from 'react';
import { Chart } from 'highcharts';
import { FileTimespan, ExtSeries, FileInformation } from '@types';
import { computeOffsets, getFileTimestamp, getPointIndex, binarySearchClosest} from '@lib/videoUtils';
import { useChartQuery } from '@contexts/ChartQueryContext';
import { useFileMap } from '@lib/files/useFileMap';

export const useVideoSyncLines = (
  chartRef: Chart | null,
  videoTimestamp: number,
  videoTimespan: FileTimespan | null,
  timestamps: number[][]
) => {
  const [offsets, setOffsets] = useState<number[]>([]);
  const [lineX, setLineX] = useState<number>(0);
  const [lineY, setLineY] = useState<number>(0);
  const [syncedDataPoints, setSyncedDataPoints] = useState<string[]>([]);
  const { findFile } = useFileMap();
  const { series } = useChartQuery();

  const resetData = () => {
    setOffsets([]);
    setLineX(0);
    setLineY(0);
    setSyncedDataPoints([]);
  };

  // Do initial calculation when timespan or series change
  useEffect(() => {
    resetData();
    if (videoTimespan === undefined || series.length === 0 || videoTimespan === null) return;
    // TODO: Don't Use only X filenames for offset calculation
    const fileKeys = series.map(s => s.x.source);
    const fileObjects = fileKeys.map(key => findFile(key)).filter((f): f is FileInformation => f !== undefined);
    setOffsets(computeOffsets(fileObjects, videoTimespan));
  }, [videoTimespan, series]);

  // TODO: This is just wrong
  const isTimestampFunction = series.length > 0 && (
    series[0].x.dataType.toLowerCase().includes('timestamp') ||
    series[0].analyzer.type === 'STRICT_TIMESTAMP'
  );

  // Updates when video plays
  useEffect(() => {
    if (timestamps.length === 0) return;
    if (isTimestampFunction) {
      updateTimestampLine(videoTimestamp);
    } else { 
      updatePointCrosshair(videoTimestamp);
    }
  }, [videoTimestamp, isTimestampFunction]);

  // Calculates the vertical line position for timestamp/functional data
  const updateTimestampLine = (videoTimestamp: number) => {
    if (chartRef === null || chartRef.series.length === 0 || videoTimespan === null) return;

    // TODO: Find a better base value for fileTimestamp
    let fileTimestamp: number | undefined = -Infinity;
  
    // TODO: This ExtSeries is yucky
    const visibleSeries = chartRef.series.filter(series => series.visible) as ExtSeries[];
    if (visibleSeries.length === 0) return;

    // Gets the first file timestamp that is not undefined
    visibleSeries.some(series => {
      if (chartRef === null) return;
      const seriesIndex = chartRef.series.indexOf(series);
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
    chartRef.series.forEach(series => {
      const value = values.find(value => value.name === series.name);
      if (value === undefined) return;
      tempValueLines.push(`${series.name}: ${value.y}`);
    });
    setSyncedDataPoints(tempValueLines);
  };

  // Calculates the crosshair position for point data
  const updatePointCrosshair = (videoTimestamp: number) => {
    // Finds the matching point index for the first visible series using the video timestamp
    if (chartRef === null || chartRef.series.length === 0) return;
    //TODO: Update this null check to be inline and return the right case
    const visibleSeries = chartRef.series.filter(series => series.visible) as ExtSeries[];
    if (visibleSeries.length === 0) return;
    const firstVisibleSeries = visibleSeries[0];
    const seriesIndex = chartRef.series.indexOf(firstVisibleSeries);
    const pointIndex = getPointIndex(
      firstVisibleSeries,
      videoTimestamp,
      offsets[seriesIndex],
      timestamps[seriesIndex]
    );

    if (pointIndex && pointIndex >= 0) {
      setLineX(firstVisibleSeries.xData[pointIndex]);
      setLineY(firstVisibleSeries.yData[pointIndex]);
    } else return;

    // Finds the point index for all the other visible series
    const values = [
      { 
        name: firstVisibleSeries.name,
        x: firstVisibleSeries.xData[pointIndex], 
        y: firstVisibleSeries.yData[pointIndex] 
      }, ...visibleSeries.slice(1).map(series => {
        if (chartRef === null || chartRef.series.length === 0) {
          throw new Error('Chart is not initialized');
        }
        const seriesIndex = chartRef.series.indexOf(series);
        const pointIndex = getPointIndex(
          series,
          videoTimestamp,
          offsets[seriesIndex],
          timestamps[seriesIndex]
        );
        if (pointIndex && pointIndex >= 0) {
          return {name: series.name, x: series.xData[pointIndex], y: series.yData[pointIndex]};
        }
      })
    ];

    // Updates the value box with the found values
    const tempValueLines: string[] = [];
    chartRef.series.forEach(series => {
      const value = values.find(value => value?.name === series.name);
      if (value === undefined) return;
      tempValueLines.push(`${series.name}: (${value.x.toFixed(5)}, ${value.y.toFixed(5)})`);
    });
    setSyncedDataPoints(tempValueLines);
  };

  return { lineX, lineY, syncedDataPoints };
};