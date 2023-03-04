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

    //loading
    const [loading, setLoading] = useState(false);

    //Only call this after fileInformation has been updated
    const [parsedData, setParsedData] = useState([]);

    const getFile = async (inputFiles, outputFiles, analyzerOptions, liveOptions) => {
        console.log(inputFiles, outputFiles, analyzerOptions, liveOptions)

        fetch(`http://${window.location.hostname}:8080/analyze?inputFiles=${inputFiles}&outputFiles=${outputFiles}&analyzer=${analyzerOptions}&liveOptions=${liveOptions}`, {
            method: 'GET'
        }).then(response => {
            console.log(response)
            response.text().then(text => {

                var headers = text.trim().split("\n")[0].split(",");

                console.log(headers)
                var h1;
                var h2;

                if (headers.length == 3) {
                    
                    if (headers[1] == "F_RPM_PRIM") {
                        h1 = 1;
                        h2 = 2;
                    } else {
                        h1 = 2;
                        h2 = 1;
                    }
                    console.log("h1: " + h1 + "  h2: " + h2)
                } else {
                    h1 = 1;
                    h2 = 0;
                }
                

                const data = text
                    .trim()
                    .split("\n")
                    .slice(1)
                    .map((line) => line.split(","))
                    .map((line) => [parseFloat(line[h2]), parseFloat(line[h1])]);
                
                setParsedData (prevState => {
                    return [...prevState, data]
                })
            })
        })
    }

    useEffect(() => {
        
        // Whenever fileInformation is updated (which happens when submit button is pressed), fetch the neccesary data
        if (fileInformation.files.length === 0) {
            return;
        }

        setLoading(true);
        setParsedData([]);

        // Now complete a request for each series
        for (var i = 0; i < fileInformation.files.length; i++) {
            var files = [];
            for (var j = 0; j < fileInformation.files[i].columns.length; j++) {
                // Create a list of all files in order (formatting for backend)
                if (!files.includes(fileInformation.files[i].columns[j].filename)) {
                    files.push(fileInformation.files[i].columns[j].filename);
                }
            }

            getFile(files, [], [fileInformation.files[i].analysis/*[0]*/], ["false"])
        }

        // Set files to be all filenames in fileInformation, without duplicates

    }, [fileInformation]);

    useEffect(() => {
        // Once necessary data is fetched, format it for the chart
        if (fileInformation.files.length === 0) {
            return;
        }

        // Update the chart options with the new data
        setChartOptions((prevState) => {
            console.log(parsedData)
            return {
                ...prevState,
                series: ( () => {
                    var series = [];
                    var colours = ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'grey']
                    for (var i = 0; i < parsedData.length; i++) {
                        console.log(fileInformation)
                        series.push({
                            name: fileInformation.files[i].columns[0].filename,
                            data: parsedData[i],
                            colour: colours[i],
                            opacity: 1
                        })
                    }
                    return series;
                })(),
                title: {
                    text: fileInformation.files[0].columns[1].header + " vs " + fileInformation.files[0].columns[0].header
                },
                xAxis: {
                    title: {
                        //Only set type to 'datetime' if the x axis is 'Timestamp (ms)'
                        type: fileInformation.files[0].columns[0].header === 'Timestamp (ms)' ? 'datetime' : 'linear',
                        text: fileInformation.files[0].columns[0].header
                    }
                },
                yAxis: {
                    title: {
                        text: fileInformation.files[0].columns[1].header
                    }
                },
                legend: {
                    enabled: true
                }
            }
        })
        setLoading(false);
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
    //Live Data fetch request function 
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
    //Live Data useEffect function
    useEffect(() => {
        let intervalId;
        //for loop to loop through file information array to check if live is true
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
            {loading && <img className="loading" src="https://i.imgur.com/PEP35pk.gif" alt="Loading..." />}
        </div>

    )
}

export default Chart;