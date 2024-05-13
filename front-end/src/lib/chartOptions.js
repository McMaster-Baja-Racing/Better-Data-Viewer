export const defaultChartOptions = {
  chart: {
    type: 'scatter',
    zoomType: 'x',
    backgroundColor: '#ffffff'
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
    enabled: true
  },
  colorAxis: {
    showInLegend: false
  }
};

const getStandardChartConfig = (chartInformation) => {

  var chartConfig = defaultChartOptions;

  chartConfig.title.text = chartInformation.files[0].columns[1].header + 
    ' vs ' + 
    chartInformation.files[0].columns[0].header;

  chartConfig.chart = {
    type: chartInformation.type,
    zoomType: 'x'
  };

  chartConfig.tooltip = { 
    xDateFormat: chartInformation.hasGPSTime ? '%A, %b %e, %Y %H:%M:%S.%L' : '%H:%M:%S.%L'
  };

  chartConfig.xAxis = {
    title: {
      text: chartInformation.files[0].columns[0].header
    },

    type: chartInformation.hasTimestampX ? 'datetime' : 'linear',

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

  return chartConfig;
};

const getDefaultChartConfig = (chartInformation, parsedData, fileNames) => {
  var chartConfig = getStandardChartConfig(chartInformation);
  const colours = ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'grey'];

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
    };
  });

  chartConfig.colorAxis.showInLegend = false;

  return chartConfig;
};

const getVideoChartConfig = (chartInformation, parsedData, fileNames) => {
  var chartConfig = getDefaultChartConfig(chartInformation, parsedData, fileNames);

  chartConfig.chart.type = 'line';

  chartConfig.boost.enabled = chartInformation.hasTimestampX;

  chartConfig.xAxis.plotLines = [{
    color: 'black',
    width: 2,
    zIndex: 3,
  }];

  chartConfig.yAxis.plotLines = [{
    color: 'black',
    width: 2,
    zIndex: 3,
  }];

  return chartConfig;
};

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
    };
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

  return chartConfig;
};

export const getChartConfig = (chartInformation, parsedData, fileNames, minMax) => {
  switch(chartInformation.type) {
    case 'coloredline': return getColourChartConfig(chartInformation, parsedData, fileNames, minMax);
    case 'video': return getVideoChartConfig(chartInformation, parsedData, fileNames);
    default: return getDefaultChartConfig(chartInformation, parsedData, fileNames);
  }
};

export const movePlotLineX = (chartOptions, x) => {
  return {
    ...chartOptions,
    xAxis: {
      ...chartOptions.xAxis,
      plotLines: [{ ...chartOptions.xAxis.plotLines[0], value: x }],
    },
  };
};

export const movePlotLines = (chartOptions, x, y) => {
  return {
    ...chartOptions,
    xAxis: {
      ...chartOptions.xAxis,
      plotLines: [{ ...chartOptions.xAxis.plotLines[0], value: x }],
    },
    yAxis: {
      ...chartOptions.yAxis,
      plotLines: [{ ...chartOptions.yAxis.plotLines[0], value: y }],
    },
  };
};