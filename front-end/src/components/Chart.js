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
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
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

    useEffect(() => {
        // Whenever fileInformation is updated (which happens when submit button is pressed), fetch the neccesary data
        if (fileInformation.length === 0) {
            return;
        }
        getSingleFile(fileInformation[0].filename);
    }, [fileInformation]);

    useEffect(() => {
        // Once necessary data is fetched, format it for the chart
        if (fileInformation.length === 0) {
            return;
        }
        var formattedData = [];

        for (var i = 0; i < parsedData.length; i++) {
            formattedData.push([parseFloat(parsedData[i][fileInformation[0].header]), parseFloat(parsedData[i][fileInformation[1].header])]);
        }
        // Update the chart options with the new data
        setChartOptions( (prevState) => {
            return {
                ...prevState,
                series: [
                    { data: formattedData }
                ],
                title: {
                    text: fileInformation[0].header + " vs " + fileInformation[1].header
                },
                xAxis: {
                    title: {
                        //Only set type to 'datetime' if the x axis is 'Timestamp (ms)'
                        type: fileInformation[0].header === 'Timestamp (ms)' ? 'datetime' : 'linear',
                        text: fileInformation[0].header
                    }
                },
                yAxis: {
                    title: {
                        text: fileInformation[1].header
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
                //console.log('Element:', entry.target);
                //console.log(`Element size: ${cr.width}px x ${cr.height}px`);
                //console.log(`Element padding: ${cr.top}px ; ${cr.left}px`);
                //console.log(Highcharts.charts)
                for (var i = 0; i < Highcharts.charts.length; i++) {
                    if (Highcharts.charts[i] !== undefined) {
                        Highcharts.charts[i].setSize(cr.width, cr.height);
                    }
                }
            }
        }, 1000));
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