import { useState, useCallback, useRef, useEffect } from 'react';
import { ApiUtil } from '@lib/apiUtils';
import {
  getHeadersIndex,
  getTimestampOffsetFromFile,
  getTimestamps,
  HUE_MAX,
  HUE_MIN,
  validateChartQuery
} from '@lib/chartUtils';
import { seriesData, MinMax } from '@types';
import { useChartQuery } from '@contexts/ChartQueryContext';
import { useChartOptions } from '@contexts/ChartOptionsContext';
import { useFileMap } from '@lib/files/useFileMap';

// TODO: Clean up this file, it is a mess
export const useChartData = () => {
  const [timestamps, setTimestamps] = useState<number[][]>([]);
  const [loading, setLoading] = useState(false);
  const minMax = useRef<MinMax>({ min: 0, max: 0 });
  const fetchIdRef = useRef(0);

  // Pull all chart settings and series from context
  const { series } = useChartQuery();
  const { findFile } = useFileMap();
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();
  // TODO: Multiple series different type support?
  const type = options.series?.[0]?.type;
  // TODO: Dont just initialize to false
  const hasGPSTime = false, hasTimestampX = false, live = false;

  useEffect(() => {
    // TODO: One day, detect if the specific sries updated rather than wiping all
    fetchChartData();
  }, [series]);

  const resetData = useCallback(() => {
    setTimestamps([]);
    minMax.current = { min: 0, max: 0 };
    chartOptionsDispatch({ type: 'CLEAR_SERIES' });
  }, [chartOptionsDispatch]);

  const fetchChartData = useCallback(async () => {
    if (!validateChartQuery(series)) return;
    const myId = ++fetchIdRef.current;
    resetData();
    setLoading(true);

    try {
      for (const file of series) {
        if (fetchIdRef.current !== myId) return;
        // Build a Column[] by iterating the defined keys
        const cols = [file.x, file.y];

        // Fetch & analyze the files based on series definition
        const { filename, text } = await ApiUtil.analyzeFilesSmart(
          file.x.dataType,
          file.y.dataType,
          file.x.source,
          file.y.source,
          file.analyzer.type,
          file.analyzer.options
        );

        if (fetchIdRef.current !== myId) return;

        // Parse headers and compute indices
        const headers = text.slice(0, text.indexOf('\n')).replace('\r', '').split(',');
        const headerIndices = getHeadersIndex(headers, cols);

        // Split into lines of fields
        const lines = text.trim().split('\n').slice(1).map(row => row.split(','));

        let seriesPoints: seriesData;

        if (type !== 'coloredLine') {
          // TODO: Don't only use the first file
          const fileKey = series[0].x.source;
          const fileObject = findFile(fileKey);
          const firstTimestamp = parseFloat(lines[0][headerIndices.x]);

          const timestampOffset = hasTimestampX && hasGPSTime && fileObject
            ? getTimestampOffsetFromFile(fileObject, firstTimestamp)
            : 0;

          seriesPoints = lines.map(fields => (
            [
              parseFloat(fields[headerIndices.x]) + timestampOffset,
              parseFloat(fields[headerIndices.y])
            ]
          ));
        } else {
          const firstColHeader = cols[0].dataType;
          const { min, max } = minMax.current = await ApiUtil.getMinMax(filename, firstColHeader);

          seriesPoints = lines.map(fields => {
            const val = parseFloat(fields[headerIndices.colour]);
            const hue = HUE_MIN + (HUE_MAX - HUE_MIN) *
              (val - min) / (max - min);

            return {
              x: parseFloat(fields[headerIndices.x]),
              y: parseFloat(fields[headerIndices.y]),
              colorValue: val,
              segmentColor: `hsl(${hue}, 100%, 50%)`
            };
          });
        }

        if (fetchIdRef.current !== myId) return;

        chartOptionsDispatch({
          type: 'ADD_SERIES',
          series: {
            type: 'line',
            name: filename,
            data: seriesPoints
          }
        });

        // Generate timestamp array
        const tsArray: number[] = hasTimestampX
          ? (seriesPoints as number[][]).map(point => point[0])
          : await getTimestamps(text);

        setTimestamps(prev => [...prev, tsArray]);
      }
    } finally {
      if (fetchIdRef.current === myId) {
        setLoading(false);
      }
    }
  }, [series, hasGPSTime, hasTimestampX, type, live]);

  return { timestamps, minMax, loading, refetch: fetchChartData };
};
