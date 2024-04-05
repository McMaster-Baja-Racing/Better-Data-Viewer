import '../../styles/chart.css';
import { defaultChartOptions, getChartConfig, movePlotLine } from '../../lib/chartOptions.js';
import { getSeriesData, getTimestamps, LIVE_DATA_INTERVAL, validateChartInformation } from '../../lib/chartUtils.js';
import { ApiUtil } from '../../lib/apiUtils.js';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Boost from 'highcharts/modules/boost';
import HighchartsColorAxis from 'highcharts/modules/coloraxis';
import { computeOffsets, getFileTimestamp, getPointIndex} from '../../lib/videoUtils.js';
import { useResizeDetector } from 'react-resize-detector';
import loadingImg from '../../assets/loading.gif';
// TODO: Fix this import (Why is it different?)
import 'highcharts-multicolor-series';
// require('highcharts-multicolor-series')(Highcharts); Keeping this old import until we test the new one

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
        [chartInformation.files[i].analyze.analysis, chartInformation.files[i].analyze.analyzerValues].filter(e => e),
        [chartInformation.live]
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
        chartInformation.dtformat
      );

      data.push(seriesData);
      tempTimestamps.push(
        chartInformation.dtformat !== 'none' ? seriesData.map(item => item[0]) : await getTimestamps(text)
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
    try {
      if (chartInformation.dtformat !== 'none'){
        let fileTimestamp = undefined;
        chartRef.current.series.some((series, index) => {
          if (series.visible) {
            fileTimestamp = getFileTimestamp(videoTimestamp, offsets[index], timestamps[index]);
            return fileTimestamp !== undefined;
          }
          return false;
        });
        if (fileTimestamp !== undefined) setLineX(Math.floor(fileTimestamp));
      } else {
        const firstActiveSeries = chartRef.current.series.find(series => series.visible);
        if (firstActiveSeries) {
          const seriesIndex = chartRef.current.series.indexOf(firstActiveSeries);
          const pointIndex = getPointIndex(
            firstActiveSeries,
            videoTimestamp,
            offsets[seriesIndex],
            timestamps[seriesIndex]
          );
          if (pointIndex >= 0) setLineX(firstActiveSeries.xData[pointIndex]);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }, [videoTimestamp, offsets, timestamps]);

  useEffect(() => {
    try {
      setChartOptions(movePlotLine(chartOptions, lineX));
    } catch (e) {
      console.log(e);
    }
  }, [lineX]);

  return (

    <div className="chartContainer" ref={ref}>
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