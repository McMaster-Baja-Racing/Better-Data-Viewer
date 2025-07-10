import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiUtil } from '@lib/apiUtils';
import {
  getHeadersIndex,
  getTimestampOffset,
  getTimestamps,
  HUE_MAX,
  HUE_MIN,
  validateChartInformation
} from '@lib/chartUtils';
import { ChartInformation, seriesData, MinMax, Column, dataColumnKeys } from '@types';

export const useChartData = (chartInformation: ChartInformation) => {
  const [parsedData, setParsedData] = useState<seriesData[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [timestamps, setTimestamps] = useState<number[][]>([]);
  const [loading, setLoading] = useState(false);
  const minMax = useRef<MinMax>({ min: 0, max: 0 });

  const resetData = () => {
    setParsedData([]);
    setFileNames([]);
    setTimestamps([]);
    minMax.current = { min: 0, max: 0 };
  };

  const fetchChartData = useCallback(async () => {
    if (!validateChartInformation(chartInformation)) return;

    const { hasGPSTime, hasTimestampX, type, live } = chartInformation;

    for (const file of chartInformation.files) {
      // Build a Column[] by iterating dataColumnKeys
      const cols = dataColumnKeys
        .map((key) => file[key])
        .filter((col): col is Column => !!col);

      // Fetch & analyze the files
      const { filename, text } = await ApiUtil.analyzeFiles(
        cols.map(col => col.filename),
        cols.map(col => col.header),
        [],
        file.analyze.type,
        file.analyze.analyzerValues.filter(e => e),
        live
      );

      setFileNames(prev => [...prev, filename]);

      // Parse headers
      const headers = text.slice(0, text.indexOf('\n')).replace('\r', '').split(',');
      const headerIndices = getHeadersIndex(headers, cols);

      // Split into lines of fields
      const lines = text.trim().split('\n').slice(1).map(row => row.split(','));

      let series: seriesData;

      if (type !== 'coloredline') {
        const timestampOffset = hasTimestampX && hasGPSTime
          ? getTimestampOffset(cols, lines, headerIndices)
          : 0;

        series = lines.map(fields => [
          parseFloat(fields[headerIndices.x]) + timestampOffset,
          parseFloat(fields[headerIndices.y])
        ]);
      } else {
        // Colour series: use first col for colour base
        const firstColHeader = cols[0].header;
        const { min, max } = minMax.current = await ApiUtil.getMinMax(filename, firstColHeader);

        series = lines.map(fields => {
          const val = parseFloat(fields[headerIndices.colour]);
          const hue = HUE_MIN + (HUE_MAX - HUE_MIN) *
            (val - minMax.current.min) / (max - min);

          return {
            x: parseFloat(fields[headerIndices.x]),
            y: parseFloat(fields[headerIndices.y]),
            colorValue: val,
            segmentColor: `hsl(${hue}, 100%, 50%)`
          };
        });
      }

      setParsedData(prev => [...prev, series]);

      // Generate timestamp array
      const tsArray: number[] = hasTimestampX
        ? (series as number[][]).map(point => point[0])
        : await getTimestamps(text);

      setTimestamps(prev => [...prev, tsArray]);
    }
  }, [chartInformation]);

  useEffect(() => {
    setLoading(true);
    resetData();
    fetchChartData();
    setLoading(false);
  }, [fetchChartData]);

  return { parsedData, fileNames, timestamps, minMax, loading, refetch: fetchChartData };
};
