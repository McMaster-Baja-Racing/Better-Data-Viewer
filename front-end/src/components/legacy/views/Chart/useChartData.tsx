import { useState, useCallback, useRef, useEffect } from 'react';
import { ApiUtil } from '@lib/apiUtils';
import {
  getHeadersIndex,
  getTimestampOffset,
  getTimestamps,
  HUE_MAX,
  HUE_MIN,
  validateChartQuery
} from '@lib/chartUtils';
import { seriesData, MinMax } from '@types';
import { useChartQuery } from '../../../../ChartQueryContext';
import { useChartOptions } from '../../../../ChartOptionsContext';

export const useChartData = () => {
  const [timestamps, setTimestamps] = useState<number[][]>([]);
  const [loading, setLoading] = useState(false);
  const minMax = useRef<MinMax>({ min: 0, max: 0 });

  // Pull all chart settings and series from context
  const { series } = useChartQuery();
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();
  // TODO: Multiple series different type support?
  const type = options.series?.[0]?.type;
  // TODO: Dont just initialize to false
  const hasGPSTime = false, hasTimestampX = false, live = false;

  useEffect(() => {
    // TODO: One day, detect if the specific sries updated rather than wiping all
    chartOptionsDispatch({ type: 'CLEAR_SERIES' });
    setTimestamps([]);
    minMax.current = { min: 0, max: 0 };
    fetchChartData();
  }, [series]);

  const fetchChartData = useCallback(async () => {
    if (!validateChartQuery(series)) return;
    setLoading(true);

    for (const file of series) {
      // Build a Column[] by iterating the defined keys
      const cols = [file.x, file.y];

      // Fetch & analyze the files based on series definition
      const { filename, text } = await ApiUtil.analyzeFiles(
        cols.map(col => col.filename),
        cols.map(col => col.header),
        [],
        file.analyzer.type,
        file.analyzer.options.filter(e => e),
        live
      );

      // Parse headers and compute indices
      const headers = text.slice(0, text.indexOf('\n')).replace('\r', '').split(',');
      const headerIndices = getHeadersIndex(headers, cols);

      // Split into lines of fields
      const lines = text.trim().split('\n').slice(1).map(row => row.split(','));

      let seriesPoints: seriesData;

      if (type !== 'coloredline') {
        const timestampOffset = hasTimestampX && hasGPSTime
          ? getTimestampOffset(cols, lines, headerIndices)
          : 0;

        seriesPoints = lines.map(fields => (
          [
            parseFloat(fields[headerIndices.x]) + timestampOffset,
            parseFloat(fields[headerIndices.y])
          ]
        ));
      } else {
        const firstColHeader = cols[0].header;
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
      setLoading(false);

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
  }, [series, hasGPSTime, hasTimestampX, type, live]);

  // useEffect(() => {
  //   setLoading(true);
  //   resetData();
  //   fetchChartData().finally(() => setLoading(false));
  // }, [fetchChartData]);

  return { timestamps, minMax, loading, refetch: fetchChartData };
};
