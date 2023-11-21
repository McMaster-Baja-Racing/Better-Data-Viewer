import '../styles/chart.css'
import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Boost from 'highcharts/modules/boost';
//import Papa from "papaparse";

Boost(Highcharts);

const Chart = ({ chartInformation }) => {
    //File information is array of column names and associated file names
    const [chartOptions, setChartOptions] = useState({
        chart: {
            type: 'line',
            zoomType: 'xy'
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
    const [fileNames, setFileNames] = useState([]);

    const getFile = async (inputFiles, outputFiles, analyzerOptions, liveOptions, columnInfo) => {
        // TODO: Remove debug code
        console.log(columnInfo);
        let inputColumns = columnInfo.map(col => col.header);
        console.log(inputColumns);
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
        for (var i = 0; i < headers.length; i++) {
            for (var j = 0; j < columnInfo.length; j++) {
                if (headers[i] === columnInfo[j].header) {
                    h.push(i);
                }
            }
        }

        const data = text
            .trim()
            .split("\n")
            .slice(1)
            .map((line) => line.split(","))
            .map((line) => [parseFloat(line[h[0]]), parseFloat(line[h[1]])]);
        console.log(data, h);

        return data;
    }

    // This function handles the higher level calling of getFile to handle it for all files as well as live data
    const getFileFormat = async () => {
        // In here the data is all added up, which prevents the chart from updating until all data is fetched
        // This also prevents liveData from adding more data as new series, and will update the graph instead
        var data = [];

        for (var i = 0; i < chartInformation.files.length; i++) {
            // Create a list of all files in order (formatting for backend)
            var files = [];
            for (var j = 0; j < chartInformation.files[i].columns.length; j++) {
                if (!files.includes(chartInformation.files[i].columns[j].filename)) {
                    files.push(chartInformation.files[i].columns[j].filename);
                }
            }
            // Fixed this little if statement with .filter(e => e)
            data.push(await getFile(files, [], [chartInformation.files[i].analyze.analysis, chartInformation.files[i].analyze.analyzerValues].filter(e => e), ["false"], chartInformation.files[i].columns))
        }

        setParsedData(data)
    }


    useEffect(() => {

        // Whenever fileInformation is updated (which happens when submit button is pressed), fetch the neccesary data
        if (chartInformation.files.length === 0) {
            return;
        }

        setLoading(true);
        setParsedData([]);
        setFileNames([]);

        // Now complete a request for each series
        getFileFormat();

        // Set files to be all filenames in fileInformation, without duplicates

    }, [chartInformation]);

    useEffect(() => {
        // Once necessary data is fetched, format it for the chart
        if (chartInformation.files.length === 0) {
            return;
        }

        // Update the chart options with the new data
        setChartOptions((prevState) => {
            //console.log(parsedData)
            return {
                ...prevState,
                series: (() => {
                    var series = [];
                    var colours = ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'grey']
                    for (var i = 0; i < parsedData.length; i++) {
                        //console.log(fileInformation)
                        series.push({
                            name: fileNames[i],
                            data: parsedData[i],
                            colour: colours[i],
                            opacity: 1
                        })
                    }
                    return series;
                })(),
                title: {
                    text: chartInformation.files[0].columns[1].header + " vs " + chartInformation.files[0].columns[0].header
                },

                chart: {
                    type: chartInformation.type,
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
            }
        })
        setLoading(false);
    }, [parsedData])

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