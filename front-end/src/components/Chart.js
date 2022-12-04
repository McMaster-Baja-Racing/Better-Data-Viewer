import '../styles/chart.css'
import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
// import f gps speed
import Papa from "papaparse";

const Chart = ({fileInformation}) => {
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


    // useEffect(() => {
    //     if (fileInformation[0].length > 0) {
    //         Papa.parse(fileInformation[0][0], {
    //             header: true,
    //             skipEmptyLines: true,
    //             complete: function (results) {
    //                 setParsedData(results.data);
    //             },
    //         });
    //     }
        
    // }, [fileInformation]);

    const changeHandler = (event) => {
        // Passing file data (event.target.files[0]) to parse using Papa.parse
        Papa.parse(fileInformation[0][0], {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                setParsedData(results.data);
            },
        });
    };

    useEffect(() => {
        console.log(parsedData);
        // Format the data to be used in the chart (2D array), the format being an array of objects with a key and value
        var formattedData = [];
        for (var i = 0; i < parsedData.length; i++) {
            formattedData.push([parseFloat(parsedData[i][fileInformation[2][0]]), parseFloat(parsedData[i][fileInformation[2][1]])]);
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