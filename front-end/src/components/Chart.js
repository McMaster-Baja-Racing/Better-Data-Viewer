import '../styles/chart.css'
import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
// import f gps speed
import Papa from "papaparse";

const Chart = ({ fileInformation }) => {
    //File information is array of column names and associated file names
    const [chartOptions, setChartOptions] = useState({
        chart: {
            zoomType: 'x',
            width: 1000,
        },
        title: {
            text: 'Forward GPS Speed'
        },
        subtitle: {
            text: document.ontouchstart === undefined ?
                'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Speed (km/h)'
            }
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
        }
    });

    const [parsedData, setParsedData] = useState([]);

    const changeHandler = (event) => {
        getSingleFile("F_GPS_SPEED.csv");
    };

    const getSingleFile = (filename) => {
        fetch(`http://localhost:8080/files/${filename}`)
            .then(response => {
                console.log(response)
                console.log(response.body) //use this to get a stream (efficient)

                response.text().then(text => { //or this to get all text at once

                    //trim the very first line
                    var lines = text.split("\n");
                    lines.shift();
                    var trimmedText = lines.join("\n");
                    //This is not the most efficient way to do this, a better way would be to use a stream (as above)

                    //Now convert such that each line is an array
                    var data = Papa.parse(text, {
                        header: true,
                        skipEmptyLines: true,
                        complete: function (results) {
                            setParsedData(results.data);
                            console.log(results.data)
                        },
                    }).data;

                })
            })
    }

    useEffect(() => {
        console.log(parsedData);
        // Format the data to be used in the chart (2D array), the format being an array of objects with a key and value
        var formattedData = [];

        for (var i = 0; i < parsedData.length; i++) {
            formattedData.push([parseFloat(parsedData[i]["Timestamp (ms)"]), parseFloat(parsedData[i]["F_GPS_SPEED"])]);
        }
        // Update the chart options with the new data
        setChartOptions({
            chart: {
                type: 'scatter',
                zoomType: 'xy'
            },
            title: {
                text: 'Forward GPS Speed'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                    'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
            },
            xAxis: {
                title: {
                    text: 'Yeah'
                }
            },
            yAxis: {
                title: {
                    text: 'Speed (km/h)'
                }
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
            series: [
                { data: formattedData }
            ]
        })


    }, [parsedData]);

    useEffect(() => {

    })

    return (
        <div className="container">
            <button className='button' onClick={changeHandler}>Load Data</button>
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