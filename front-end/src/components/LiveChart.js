import '../styles/chart.css'
import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Boost from 'highcharts/modules/boost';

//Boost(Highcharts);

const LiveChart = () => {
    //File information is array of column names and associated file names
    const [chartOptions, setChartOptions] = useState({
        chart: {
            type: 'spline',
            zoomType: 'x'
        },
        title: {
            text: 'Live Data'
        },
        legend: {
            enabled: false
        },
        accessibility: {
            enabled: false
        },
        plotOptions: {
            spline: {
                marker: {
                    enabled: false
                }
            }
        },
        series: [{
            data: [[5, 2] , [1,5], [4,5]]
        }]
    });

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
    //Call fetchData on an interval
    useEffect(() => {
        const interval = setInterval(() => {
            fetchData();
        }, 250);
        return () => clearInterval(interval);
    }, []);
    

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

export default LiveChart;