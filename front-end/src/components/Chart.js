import '../styles/chart.css'
import React, { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Boost from 'highcharts/modules/boost';
import HighchartsColorAxis from "highcharts/modules/coloraxis";
// TODO: Fix this import (Why is it different?)
require('highcharts-multicolor-series')(Highcharts);

HighchartsColorAxis(Highcharts);
Boost(Highcharts);

const Chart = ({ chartInformation }) => {
    //File information is array of column names and associated file names
    const [chartOptions, setChartOptions] = useState({
        chart: {
            type: 'scatter',
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
        },
        boost: {
            enabled: true
        }
    });

    //loading
    const [loading, setLoading] = useState(false);

    //Only call this after fileInformation has been updated
    const [parsedData, setParsedData] = useState([]);
    const [fileNames, setFileNames] = useState([]);
    // useref for minMax
    let minMax = useRef([0, 0]);

    

    // This function handles the fetching of the data from the backend
    const getFile = async (inputFiles, outputFiles, analyzerOptions, liveOptions, columnInfo) => {
        let inputColumns = columnInfo.map(col => col.header);
        // Using async / await rather than .then() allows me to return the data from the function easily
        const response = await fetch(`http://${window.location.hostname}:8080/analyze?inputFiles=${inputFiles}&inputColumns=${inputColumns}&outputFiles=${outputFiles}&analyzer=${analyzerOptions}&liveOptions=${liveOptions}`, {
            method: 'GET'
        })

        if (!response.ok) {
            alert(`An error has occured!\nCode: ${response.status}\n${await response.text()}`);
            return
        }

        const filename = response.headers.get("content-disposition").split("filename=")[1].slice(1, -1)
        setFileNames(prevState => {
            // return without duplicates
            return [...prevState, filename]
        })

        const text = await response.text()

        var headers = text.trim().split("\n")[0].split(",");
        headers[headers.length - 1] = headers[headers.length - 1].replace("\r", "")
        var h = [];

        // This will find the index of the headers in the file (works for any number of headers)
        for (var i = 0; i < columnInfo.length; i++) {
            for (var j = 0; j < headers.length; j++) {
                if (columnInfo[i].header === headers[j]) {
                    h.push(j);
                }
            }
        }

        // Get all the lines of the file, and split them into arrays
        const lines = text.trim().split("\n").slice(1).map((line) => line.split(","))

        // If not colour, just return the data as is in array format
        if (chartInformation.type !== "colour") {
            return lines.map((line) => {
                return [parseFloat(line[h[0]]), parseFloat(line[h[1]])];
            })
        }

        // If colour, return the data in object format
        let minhue = 150;
        let maxhue = 0;
        
        // Make a request to get the maximum and minimum values of the colour value
        // Use method @GetMapping("/files/maxmin/{filename:.+}")
        
        const minMaxResponse = await fetch(`http://${window.location.hostname}:8080/files/maxmin/${filename}?headerName=${columnInfo[2].header}`, {
            method: 'GET'
        })

        if (!minMaxResponse.ok) {
            alert(`An error has occured!\nCode: ${minMaxResponse.status}\n${await minMaxResponse.text()}`);
            return
        }

        let [minval, maxval] = (await minMaxResponse.text()).split(",").map(parseFloat);
        minMax.current = [minval, maxval];

        return lines.map((line) => {

            let val = parseFloat(line[h[2]])
            let hue = minhue + (maxhue - minhue) * (val - minval) / (maxval - minval);

            return { 
                x: parseFloat(line[h[0]]), 
                y: parseFloat(line[h[1]]), 
                colorValue: val, 
                segmentColor: `hsl(${hue}, 100%, 50%)`
            };
        })
    }

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
                //if (!files.includes(chartInformation.files[i].columns[j].filename)) {
                    files.push(chartInformation.files[i].columns[j].filename);
                //}
            }
            // Fixed this little if statement with .filter(e => e)
            data.push(await getFile(files, [], [chartInformation.files[i].analyze.analysis, chartInformation.files[i].analyze.analyzerValues].filter(e => e), ["false"], chartInformation.files[i].columns))
        }
        setParsedData(data)
        setLoading(false);
    }

    // Whenever fileInformation is updated (which happens when submit button is pressed), fetch the neccesary data
    useEffect(() => {
        if (chartInformation.files.length === 0) {
            return;
        }

        console.log("Chart Information: ")
        console.log(chartInformation)

        
        setParsedData([]);
        setFileNames([]);

        // Now complete a request for each series
        
        getFileFormat();

        // Set files to be all filenames in fileInformation, without duplicates
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartInformation]);

    // Once necessary data is fetched, format it for the chart
    useEffect(() => {
        if (chartInformation.files.length === 0) {
            return;
        }

        // Update the chart options with the new data
        setChartOptions((prevState) => {

            return {
                series: (() => {
                    var series = [];
                    if (chartInformation.type !== "colour") {
                        // Normal type of graph
                        var colours = ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'grey']
                        for (var j = 0; j < parsedData.length; j++) {
                            series.push({
                                name: fileNames[j],
                                data: parsedData[j],
                                colour: colours[j],
                                opacity: 1,
                                colorAxis: false
                            })
                        }
                    } else {
                        // XYColour graph
                        for (j = 0; j < parsedData.length; j++) {
                            series.push({
                                name: fileNames[j],
                                data: parsedData[j],
                                colorKey: 'colorValue',
                                turboThreshold: 0,
                                opacity: 1,
                            })
                        }
                    }
                    return series;
                })(),
                title: {
                    text: chartInformation.files[0].columns[1].header + " vs " + chartInformation.files[0].columns[0].header
                },
                chart: {
                    type: chartInformation.type === "colour" ? 'coloredline' : chartInformation.type,
                    zoomType: 'x'
                },
                xAxis: {
                    title: {
                        //Only set type to 'datetime' if the x axis is 'Timestamp (ms)'
                        type: chartInformation.files[0].columns[0].header === 'Timestamp (ms)' ? 'datetime' : 'linear',
                        text: chartInformation.files[0].columns[0].header
                    }
                },
                yAxis: {
                    title: {
                        text: chartInformation.files[0].columns[1].header
                    }
                },
                legend: {
                    enabled: true
                },
                colorAxis: (() => {
                    if (chartInformation.type === "colour") {
                        console.log(`minMax[0]: ${minMax.current[0]}, minMax[1]: ${minMax.current[1]}`)
                        return {
                            min: minMax.current[0],
                            max: minMax.current[1],
                            stops: [
                                [0.1, '#20ff60'], // green
                                [0.5, '#DDDF0D'], // yellow
                                [0.9, '#ff0000'] // red
                            ]
                            
                        }
                    } else {
                        return {
                            showInLegend: false
                        }
                    }
                })(),
                boost: {
                    enabled: chartInformation.type === "colour" ? false : true
                }

            }
        })
        
    }, [parsedData, chartInformation, fileNames])

    // This function is used to throttle the resize observer
    function throttle(f, delay) {
        let timer = 0;
        return function (...args) {
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

    // This function loops when live is true, and updates the chart every 500ms
    useEffect(() => {
        let intervalId;

        if (chartInformation.live) {
            intervalId = setInterval(() => {
                getFileFormat();
            }, 2000);
        }

        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartInformation.live]);

    return (

        <div className="chartContainer">
            <div className='chart'>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={chartOptions}
                />
            </div>
            {loading && <img className="loading" src={process.env.PUBLIC_URL + 'eeee.gif'} alt="Loading..." />}
        </div>

    )
}

export default Chart;