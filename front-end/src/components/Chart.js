import '../styles/chart.css'
import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Papa from "papaparse";

const Chart = ({ fileInformation }) => {
    //File information is array of column names and associated file names
    const [chartOptions, setChartOptions] = useState({
        chart: {
            type: 'line',
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

    const getSingleFile = async (filename) => {
        fetch(`http://${window.location.hostname}:8080/files/${filename}`)
            .then(response => {
                //console.log(response)
                //console.log(response.body) //use this to get a stream (efficient)

                response.text().then(text => { //or this to get all text at once

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

    const fetchAccelCurve = (primary, secondary) => {
        fetch(`http://${window.location.hostname}:8080/filess/${primary}/${secondary}?analysis=AccelCurve`)
            .then(response => {
                console.log(response)
                response.text().then(text => { //or this to get all text at once
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
        // Case where only one file is selected
        if (fileInformation.columns[0].filename === fileInformation.columns[1].filename) {
            getSingleFile(fileInformation.columns[0].filename);
            return;
        }
        // Case where two different files are selected
        if (fileInformation.columns[0].filename !== fileInformation.columns[1].filename) {
            console.log("Two files selected")
            if (fileInformation.type === "AccelCurve") {
                console.log("Accel Curve")
                fetchAccelCurve(fileInformation.columns[0].filename, fileInformation.columns[1].filename);
                return;
            }
        }
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
                    text: fileInformation.columns[0].header + " vs " + fileInformation.columns[1].header
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