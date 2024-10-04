import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiUtil, MinMax } from '@lib/apiUtils';
import { getHeadersIndex, getTimestampOffset, getTimestamps, HUE_MAX, HUE_MIN, validateChartInformation } from '@lib/chartUtils';
import { seriesData } from '@lib/chartUtils';
import { chartInformation } from '@components/App';

export const useChartData = (chartInformation: chartInformation) => {
  const [parsedData, setParsedData] = useState<seriesData[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [timestamps, setTimestamps] = useState<number[][]>([]);
  const [loading, setLoading] = useState(false);
  let minMax = useRef<MinMax>({ min: 0, max: 0 });

  const resetData = () => {
    setParsedData([]);
    setFileNames([]);
    setTimestamps([]); // TODO: Maybe not this line
    minMax.current = { min: 0, max: 0 };
  };

  const fetchChartData = useCallback(async () => {
    if (!validateChartInformation(chartInformation)) return;

    const { hasGPSTime, hasTimestampX, type } = chartInformation

    for (const file of chartInformation.files) {
      const { columns, analyze } = file;

      const { filename, text } = await ApiUtil.analyzeFiles(
        columns.map(col => col.filename), 
        columns.map(col => col.header), 
        [], 
        analyze.type, 
        analyze.analyzerValues.filter(e => e), 
        chartInformation.live
      );

      setFileNames(prev => [...prev, filename]);

      // TODO: Maybe separate this logic out since its just formatting
      let headers = text
        .slice(0, text.indexOf('\n'))
        .replace('\r', '')
        .split(',');

      const headerIndices = getHeadersIndex(headers, columns);

      const lines = text.trim().split('\n').slice(1).map((line) => line.split(','));

      // TODO: I dont like this handling both cases which are very separate
      let seriesData: seriesData;

      if (type !== 'coloredline') {
        const timestampOffset = hasTimestampX && hasGPSTime ? getTimestampOffset(columns, lines, headerIndices) : 0;
        seriesData = lines.map((line) => {
          return [parseFloat(line[headerIndices.x]) + timestampOffset, parseFloat(line[headerIndices.y])];
        });
      } else {
        // TODO: Currently only doing this for the first column. Also only should be done if colour mode is enabled
        const { min, max } = minMax.current = await ApiUtil.getMinMax(filename, columns[0].header);

        seriesData = lines.map((line) => {

          let val = parseFloat(line[headerIndices.colour]);
          let hue = HUE_MIN + (HUE_MAX - HUE_MIN) * (val - minMax.current.min) / (max - min);
      
          return { 
            x: parseFloat(line[headerIndices.x]), 
            y: parseFloat(line[headerIndices.y]), 
            colorValue: val, 
            segmentColor: `hsl(${hue}, 100%, 50%)`
          };
        });
      }
      setParsedData(prev => [...prev, seriesData]);

      // TODO: This while timestamp stuff shouldn't  be needed anymore
      let timestamps: number[];
      if (hasTimestampX) {
        // TODO: Fix this case, which seems to be an overlap of colour and syncing timestamps
        timestamps = seriesData.map(item => item[0]) as number[]
      } else {
        timestamps = await getTimestamps(text);
      }

      setTimestamps(prev => [...prev, timestamps]);
    }

  }, [chartInformation]);

  useEffect(() => {
    setLoading(true);
    resetData();
    fetchChartData();
    setLoading(false);
  }, [fetchChartData]);

  return { parsedData, fileNames, timestamps, minMax, loading, refetch: fetchChartData };
}
