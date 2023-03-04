import '../styles/chart.css'
import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Boost from 'highcharts/modules/boost';
import Papa from "papaparse";

Boost(Highcharts);

const Chart = ({ fileInformation }) => {
    //File information is array of column names and associated file names
    const [chartOptions, setChartOptions] = useState({
        chart: {
            type: 'spline',
            zoomType: 'x'
        },
        title: {
            text: 'Template'
        },
        subtitle: {
            text: document.ontouchstart === undefined ?
                'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
        },
        legend: {
            enabled: false
        },
        accessibility: {
            enabled: false
        }
    });

    //Only call this after fileInformation has been updated
    const [parsedData, setParsedData] = useState([]);

    const getFile = async (inputFiles, outputFiles, analyzerOptions, liveOptions) => {
        console.log(inputFiles, outputFiles, analyzerOptions, liveOptions)

        fetch(`http://${window.location.hostname}:8080/analyze?inputFiles=${inputFiles}&outputFiles=${outputFiles}&analyzer=${analyzerOptions}&liveOptions=${liveOptions}`, {
            method: 'GET'
        }).then(response => {
            console.log(response)
            response.text().then(text => {
                console.log(text)
                //Now convert such that each line is an array
                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function (results) {

                        setParsedData(results.data);
                    },
                })
            })
        })
    }

    useEffect(() => {
        // Whenever fileInformation is updated (which happens when submit button is pressed), fetch the neccesary data
        if (fileInformation.columns.length === 0) {
            return;
        }
        // Set files to be all filenames in fileInformation, without duplicates
        var files = [];
        for (var i = 0; i < fileInformation.columns.length; i++) {
            if (!files.includes(fileInformation.columns[i].filename)) {
                files.push(fileInformation.columns[i].filename);
            }
        }


        getFile(files,[], [fileInformation.analysis[0]], ["false"])

    }, [fileInformation]);

    useEffect(() => {
        // Once necessary data is fetched, format it for the chart
        if (fileInformation.columns.length === 0) {
            return;
        }
        var formattedData = [];

        for (var i = 0; i < parsedData.length; i++) {
            formattedData.push([Math.round(parseFloat(parsedData[i][fileInformation.columns[0].header])*100.0) / 100, Math.round(parseFloat(parsedData[i][fileInformation.columns[1].header])*100.0)/100]);
        }
        // Update the chart options with the new data
        setChartOptions( (prevState) => {
            return {
                ...prevState,
                series: [
                    { data: formattedData }
                ],
                title: {
                    text: fileInformation.columns[1].header + " vs " + fileInformation.columns[0].header
                },
                xAxis: {
                    title: {
                        //Only set type to 'datetime' if the x axis is 'Timestamp (ms)'
                        type: fileInformation.columns[0].header === 'Timestamp (ms)' ? 'datetime' : 'linear',
                        text: fileInformation.columns[0].header
                    }
                },
                yAxis: {
                    title: {
                        text: fileInformation.columns[1].header
                    }
                },
            }
        })
    }, [parsedData])

    function throttle(f, delay) {
        let timer = 0;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => f.apply(this, args), delay);
        }
    }

    // Observe the chartContainer div and resize the chart when it changes size
    // Keep in mind this will need to change when we have multiple charts
    useEffect(() => {
        const chartContainer = document.querySelector('.chartContainer');
        const resizeObserver = new ResizeObserver(throttle(entries => {
            for (let entry of entries) {
                const cr = entry.contentRect;
                for (var i = 0; i < Highcharts.charts.length; i++) {
                    if (Highcharts.charts[i] !== undefined) {
                        Highcharts.charts[i].setSize(cr.width, cr.height);
                    }
                }
            }
        }, 100));
        //run observer with a delay
        resizeObserver.observe(chartContainer);
    }, [])

    return (

        <div className="chartContainer">
            <div className='chart'>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={chartOptions}
                />
            </div>
        </div>

    )
}

export default Chart;