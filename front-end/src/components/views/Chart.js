import '../../styles/chart.css'
import { defaultChartOptions, getChartConfig } from '../../lib/chartOptions.js'
import { getSeriesData, LIVE_DATA_INTERVAL, validateChartInformation } from '../../lib/chartUtils.js';
import { ApiUtil } from '../../lib/apiUtils.js';
import React, { useState, useEffect, useRef } from 'react';
import Highcharts, { chart } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Boost from 'highcharts/modules/boost';
import HighchartsColorAxis from "highcharts/modules/coloraxis";
import { computeOffsets, getPointIndex } from '../../lib/videoUtils.js';
import { useResizeDetector } from 'react-resize-detector';
import loadingImg from '../../assets/loading.gif';
// TODO: Fix this import (Why is it different?)
require('highcharts-multicolor-series')(Highcharts);

HighchartsColorAxis(Highcharts);
Boost(Highcharts);

const Chart = ({ chartInformation, videoInformation }) => {

    const [chartOptions, setChartOptions] = useState(defaultChartOptions);
    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState([]);
    const [fileNames, setFileNames] = useState([]);
    const [offsets, setOffsets] = useState([]);
    const [timestamps, setTimestamps] = useState([]);
    let minMax = useRef([0, 0]);

    // Fetch the data from the server and format it for the chart
    const getFileFormat = async () => {
        // Runs through all the series and fetches the data, then updates the graph
        // This also prevents liveData from adding more data as a separate series
        var data = [];
        for (var i = 0; i < chartInformation.files.length; i++) {
            // Create a list of all files in order (formatting for backend)
            let files = chartInformation.files[i].columns.map(column => column.filename);
            let inputColumns = chartInformation.files[i].columns.map(col => col.header);

            const response = await ApiUtil.analyzeFiles(files, inputColumns, [], [chartInformation.files[i].analyze.analysis, chartInformation.files[i].analyze.analyzerValues].filter(e => e), [chartInformation.live])

            const filename = response.headers.get("content-disposition").split("filename=")[1].slice(1, -1)
            setFileNames(prevState =>  [...prevState, filename])

            data.push(await getSeriesData(response, filename, inputColumns, minMax, chartInformation.type))
        }
        setParsedData(data)
    }

    // Whenever chartInformation is updated (which happens when submit button is pressed), fetch the neccesary data
    useEffect(() => {
        if(!validateChartInformation(chartInformation)) return;
        
        setLoading(true);
        setParsedData([]);
        setFileNames([]);

        getFileFormat();
        setLoading(false);
    }, [chartInformation]);

    // Once necessary data is fetched, format it for the chart
    useEffect(() => {
        if(!validateChartInformation(chartInformation)) return;

        // Update the chart options with the new data
        setChartOptions((prevState) => {
            return {
                ...prevState,
                ...getChartConfig(chartInformation, parsedData, fileNames, minMax.current)
            }
        });
        
    }, [parsedData, fileNames])

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
    }, [chartInformation]);

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
        if (videoInformation === undefined) return
        setOffsets(computeOffsets(videoInformation, chartInformation))
    }, [videoInformation, chartInformation])

    // Handles updating the chart when the video timestamp changes
    useEffect(() => {
        try {
            console.log(videoInformation.videoTimestamp)
            // Computes the point and series which overlap with the video timestamp
            const seriesPointIndeces = []
            chartRef.current.chart.series.forEach(series => {
                const seriesIndex = chartRef.current.chart.series.indexOf(series)
                const pointIndex = getPointIndex(series, videoInformation.videoTimestamp, offsets[seriesIndex], timestamps[seriesIndex])
                if (pointIndex >= 0) seriesPointIndeces.push({series: seriesIndex, point: pointIndex})
            })
            // Updates the chart to show the point that is closest to the video timestamp
            if (seriesPointIndeces.length === 0) return
            chartRef.current.chart.series[seriesPointIndeces[0].series].points[seriesPointIndeces[0].point].onMouseOver()
            if (seriesPointIndeces.length > 1) seriesPointIndeces.slice(1).forEach(seriesPointIndex => {
                chartRef.current.chart.series[seriesPointIndex.series].points[seriesPointIndex.point].setState('hover')
            })
        } catch (e) {
            console.log(e)
        }
        
    }, [videoInformation])

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

    )
}

export default Chart;