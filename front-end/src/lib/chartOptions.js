export const defaultChartOptions = {
    chart: {
        type: 'scatter',
        zoomType: 'x',
    },
    title: {
        text: 'Template'
    },
    subtitle: {
        text: document.ontouchstart === undefined ?
            'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
    },
    legend: {
        enabled: true
    },
    accessibility: {
        enabled: false
    },
    boost: {
        enabled: false
    },
    colorAxis: {
        showInLegend: false
    }
}

const getStandardChartConfig = (chartInformation) => {

    var chartConfig = defaultChartOptions;

    chartConfig.title.text = chartInformation.files[0].columns[1].header + " vs " + chartInformation.files[0].columns[0].header;

    chartConfig.chart = {
        type: chartInformation.type === 'video' ? 'line' : chartInformation.type,
        zoomType: 'y'
    };

    chartConfig.xAxis = {
        title: {
            //Only set type to 'datetime' if the x axis is 'Timestamp (ms)'
            type: chartInformation.files[0].columns[0].header === 'Timestamp (ms)' ? 'datetime' : 'linear',
            text: chartInformation.files[0].columns[0].header
        },
        lineColor: 'grey',
        tickColor: 'grey',
    };

    chartConfig.yAxis = {
        title: {
            text: chartInformation.files[0].columns[1].header
        },
        lineColor: 'grey',
        tickColor: 'grey',
        lineWidth: 1,
    };

    chartConfig.boost = { enabled: chartInformation.type === 'video' ? false : true }

    return chartConfig;
}

const getNoColourChartConfig = (chartInformation, parsedData, fileNames) => {
    var chartConfig = getStandardChartConfig(chartInformation);
    const colours = ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'grey']

    chartConfig.series = parsedData.map((data, index) => {
        return {
            name: fileNames[index],
            data: data,
            colour: colours[index],
            opacity: 1,
            colorAxis: false, 
            findNearestPointBy: 'x',
            boostThreshold: 1,
            marker: { enabled: false }
        }
    });

    chartConfig.colorAxis.showInLegend = false;

    chartConfig.boost.enabled = true;

    return chartConfig;
}

const getColourChartConfig = (chartInformation, parsedData, fileNames, minMax) => {
    var chartConfig = getStandardChartConfig(chartInformation);

    chartConfig.series = parsedData.map((data, index) => {
        return {
            name: fileNames[index],
            data: data,
            colour: 'colorValue',
            opacity: 1,
            turboThreshold: 0,
            findNearestPointBy: 'xy',
        }
    });

    chartConfig.colorAxis = {
        min: minMax.current[0],
        max: minMax.current[1],
        stops: [
            [0.1, '#20ff60'], // green
            [0.5, '#DDDF0D'], // yellow
            [0.9, '#ff0000'] // red
        ]
    };

    chartConfig.boost.enabled = false;

    return chartConfig;
}

export const getChartConfig = (chartInformation, parsedData, fileNames, minMax) => {
    if (chartInformation.type === 'coloredline') {
        return getColourChartConfig(chartInformation, parsedData, fileNames, minMax);
    } else {
        return getNoColourChartConfig(chartInformation, parsedData, fileNames);
    }
}