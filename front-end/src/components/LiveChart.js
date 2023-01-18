import '../styles/chart.css'
import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

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
        series: [{
            data: []
        }]
    });

    const fetchData = async () => {
        // Fetch the data from the server
        fetch("https://demo-live-data.highcharts.com/time-data.csv").then((response) => {
            response.text().then((text) => {
                console.log(text)
                // Parse the data
                const data = text
                    .trim()
                    .split("\n")
                    .map((line) => line.split(","))
                    .map((line) => [Date.parse(line[0]), parseFloat(line[1])]);
                    
                // Update the chart
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
        }, 1000);
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