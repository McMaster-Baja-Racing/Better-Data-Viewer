import '../styles/chart.css'
import { defaultChartOptions, getChartConfig } from '../lib/chartOptions.js'
import { getSeriesData, LIVE_DATA_INTERVAL } from '../lib/chartUtils.js';
import { ApiUtil } from '../lib/apiUtils.js';
import React, { useState, useEffect, useRef } from 'react';
import Highcharts, { chart } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Boost from 'highcharts/modules/boost';
import HighchartsColorAxis from "highcharts/modules/coloraxis";
import { useResizeDetector } from 'react-resize-detector';
// import loading from assets folder
import loadingImg from '../assets/loading.gif';
// TODO: Fix this import (Why is it different?)
require('highcharts-multicolor-series')(Highcharts);

HighchartsColorAxis(Highcharts);
Boost(Highcharts);

const Chart = ({ chartInformation }) => {
    //File information is array of column names and associated file names
    const [chartOptions, setChartOptions] = useState(defaultChartOptions);
    //loading
    const [loading, setLoading] = useState(false);

    const [parsedData, setParsedData] = useState([]);
    const [fileNames, setFileNames] = useState([]); // TODO: FileNames should probably just be parsed from chartInformation using a function
    let minMax = useRef([0, 0]);

    // This function handles the higher level calling of getFile to handle it for all files as well as live data
    const getFileFormat = async () => {
        // In here the data is all added up, which prevents the chart from updating until all data is fetched
        // This also prevents liveData from adding more data as new series, and will update the graph instead
        setLoading(true);

        var data = [];
        for (var i = 0; i < chartInformation.files.length; i++) {
            // Create a list of all files in order (formatting for backend)
            var files = [];
            
            for (var j = 0; j < chartInformation.files[i].columns.length; j++) {
                files.push(chartInformation.files[i].columns[j].filename);
            }
            // Fixed this little if statement with .filter(e => e)
            let inputColumns = chartInformation.files[i].columns.map(col => col.header);
            const response = await ApiUtil.analyzeFiles(files, inputColumns, [], [chartInformation.files[i].analyze.analysis, chartInformation.files[i].analyze.analyzerValues].filter(e => e), ["false"])

            const filename = response.headers.get("content-disposition").split("filename=")[1].slice(1, -1)
            setFileNames(prevState =>  [...prevState, filename])

            data.push(await getSeriesData(response, filename, inputColumns, minMax, chartInformation.type))
        }
        setParsedData(data)
        setLoading(false);
    }

    // Whenever fileInformation is updated (which happens when submit button is pressed), fetch the neccesary data
    useEffect(() => {
        if(!chartInformation) {
            return;
        }
        if (chartInformation.files.length === 0) {
            return;
        }
        
        setParsedData([]);
        setFileNames([]);

        getFileFormat();
    }, [chartInformation]);

    // Once necessary data is fetched, format it for the chart
    useEffect(() => {
        if (!chartInformation){
            return;
        }
        if (chartInformation.files.length === 0) {
            return;
        }

        // Update the chart options with the new data
        setChartOptions((prevState) => {
            return {
                ...prevState,
                ...getChartConfig(chartInformation, parsedData, fileNames, minMax.current)
            }
        });
        
    }, [parsedData, chartInformation, fileNames])

    // This function loops when live is true, and updates the chart every 500ms
    useEffect(() => {
        if (!chartInformation){
            return;
        }
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