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
    const getSingleFile = async (filename, analyzers) => {
        console.log(filename, analyzers)
        fetch(`http://${window.location.hostname}:8080/analyze/${filename}?analysis=${analyzers}`)
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

    const [parsedData2, setParsedData2] = useState([]);

    const getSingleFile2 = async (filename, analyzers) => {
        console.log(filename, analyzers)
        fetch(`http://${window.location.hostname}:8080/analyze/${filename}?analysis=${analyzers}`)
            .then(response => {
                //console.log(response)
                //console.log(response.body) //use this to get a stream (efficient)

                response.text().then(text => { //or this to get all text at once

                    //Now convert such that each line is an array
                    Papa.parse(text, {
                        header: true,
                        skipEmptyLines: true,
                        complete: function (results) {
                            setParsedData2(results.data);
                        },
                    })

                })
            })
    }

    const fetchAccelCurve = (secondary, primary) => {
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
            
            if (fileInformation.analysis[0] === "AccelCurve") {
                console.log("Accel Curve 2")
                fetchAccelCurve(fileInformation.columns[0].filename, fileInformation.columns[1].filename);
                return;
            } else {
                getSingleFile(fileInformation.columns[0].filename, fileInformation.analysis);
                getSingleFile2("accelCurve2.csv", fileInformation.analysis);
            }
            return;
        }
        // Case where two different files are selected
        if (fileInformation.columns[0].filename !== fileInformation.columns[1].filename) {
            console.log("Two files selected")
            if (fileInformation.analysis[0] === "AccelCurve") {
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
        // var formattedData = [];

        // for (var i = 0; i < parsedData.length; i++) {
        //     for (var j = 0; j < parsedData[i].length; j++) {
        //         if (parsedData[i][j][fileInformation.columns[0].header] == "Timestamp (ms)") {
        //             formattedData.push([Math.round(Date.parse(parsedData[i][j][fileInformation.columns[0].header])*100.0) / 100, Math.round(parseFloat(parsedData[i][j][fileInformation.columns[1].header])*100.0)/100]);
        //         }else{
        //             formattedData.push([Math.round(parseFloat(parsedData[i][j][fileInformation.columns[0].header])*100.0) / 100, Math.round(parseFloat(parsedData[i][j][fileInformation.columns[1].header])*100.0)/100]);
        //         }
        //     }
        // }

        // Update the chart options with the new data
        setChartOptions( (prevState) => {
            return {
                ...prevState,
                series: ( () => {
                    var series = [];
                    var colours = ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'grey']
                    for (var i = 0; i < parsedData.length; i++) {
                        series.push({
                            name: fileInformation.columns[i].filename,
                            data: parsedData[i],
                            colour: colours[i],
                            opacity: 0.5
                        })
                    }
                    return series;
                })(),
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
                legend: {
                    enabled: true
                }
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

    const fetchData = async (filename) => {
        // Fetch the data from the server
        fetch(`http://${window.location.hostname}:8080/filess/live_F_RPM_PRIM.csv/live_F_RPM_SEC.csv?analysis=AccelCurve`).then((response) => {
            response.text().then((text) => {
                // Parse the data into an array of arrays
                const data = text
                    .trim()
                    .split("\n")
                    .slice(1)
                    .map((line) => line.split(","))
                    .map((line) => [parseFloat(line[2]), parseFloat(line[1])]);
                
                setChartOptions({
                    series: [{
                        data: data
                    }]
                });
            })
        });
    }

    useEffect(() => {
        let intervalId;
        for (var i =0; i<fileInformation.length; i++) {
            if (fileInformation[i].live){
                intervalId = setInterval(() => {
                            fetchData();
                        }, 250);
            }
        }
        return () => clearInterval(intervalId);
      }, []);

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