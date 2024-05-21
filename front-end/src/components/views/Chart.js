import '../../styles/chart.css';
import { defaultChartOptions, getChartConfig, movePlotLineX, movePlotLines } from '../../lib/chartOptions.js';
import { getSeriesData, getTimestamps, LIVE_DATA_INTERVAL, validateChartInformation } from '../../lib/chartUtils.js';
import { ApiUtil } from '../../lib/apiUtils.js';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Boost from 'highcharts/modules/boost';
import HighchartsColorAxis from 'highcharts/modules/coloraxis';
import { computeOffsets, getFileTimestamp, getPointIndex, binarySearchClosest} from '../../lib/videoUtils.js';
import { useResizeDetector } from 'react-resize-detector';
import loadingImg from '../../assets/loading.gif';
// TODO: Fix this import (Why is it different?)
// import 'highcharts-multicolor-series';

// eslint-disable-next-line no-undef
require('highcharts-multicolor-series')(Highcharts); // Keeping this old import until we test the new one

HighchartsColorAxis(Highcharts);
Boost(Highcharts);

const Chart = ({ chartInformation, video, videoTimestamp }) => {

  const [chartOptions, setChartOptions] = useState(defaultChartOptions);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [offsets, setOffsets] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [lineX, setLineX] = useState(0);
  const [linePoint, setLinePoint] = useState({x: 0, y: 0});
  const [valueLines, setValueLines] = useState([]);
  let minMax = useRef([0, 0]);

  // Fetch the data from the server and format it for the chart
  const getFileFormat = useCallback(async () => {
    // Runs through all the series and fetches the data, then updates the graph
    // This also prevents liveData from adding more data as a separate series
    var data = [];
    const tempTimestamps = [];
    for (var i = 0; i < chartInformation.files.length; i++) {
      // Create a list of all files in order (formatting for backend)
      let files = chartInformation.files[i].columns.map(column => column.filename);
      let inputColumns = chartInformation.files[i].columns;

      const response = await ApiUtil.analyzeFiles(
        files,
        inputColumns.map(col => col.header),
        [],
        chartInformation.files[i].analyze.analysis,
        chartInformation.files[i].analyze.analyzerValues.filter(e => e),
        chartInformation.live
      );

      const filename = response.headers.get('content-disposition').split('filename=')[1].slice(1, -1);
      setFileNames(prevState => [...prevState, filename]);

      const text = await response.text();

      const seriesData = await getSeriesData(
        text,
        filename,
        inputColumns,
        minMax,
        chartInformation.type,
        chartInformation.hasTimestampX,
        chartInformation.hasGPSTime
      );

      data.push(seriesData);
      tempTimestamps.push(
        chartInformation.hasTimestampX ? seriesData.map(item => item[0]) : await getTimestamps(text)
      );
    }
    setParsedData(data);
    setTimestamps(tempTimestamps);


  }, [chartInformation, setFileNames, setParsedData, setTimestamps]);

  // Whenever chartInformation is updated (which happens when submit button is pressed), fetch the neccesary data
  useEffect(() => {
    if(!validateChartInformation(chartInformation)) return;
        
    setLoading(true);
    setParsedData([]);
    setFileNames([]);

    getFileFormat();
    setLoading(false);
  }, [chartInformation, getFileFormat]);

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
        getFileFormat(); // TODO: Prevent loading animation or alter it
      }, LIVE_DATA_INTERVAL);
    }

    return () => clearInterval(intervalId);
  }, [chartInformation, getFileFormat]);

  const chartRef = useRef(null);
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
    chartInformation.hasTimestampX ? lineXUpdate(videoTimestamp) : linePointUpdate(videoTimestamp);
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
    let fileTimestamp = undefined;
    const visibleSeries = chartRef.current.series.filter(series => series.visible);
    if (visibleSeries.length === 0) return;

    // Gets the first file timestamp that is not undefined
    visibleSeries.some(series => {
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
    const tempValueLines = [];
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