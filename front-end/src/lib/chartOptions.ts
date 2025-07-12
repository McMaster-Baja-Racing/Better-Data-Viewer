import { Options } from 'highcharts';
import { ChartInformation } from '@types';

export const defaultChartOptions: Options = {
  chart: {
    type: 'scatter',
    zooming: {
      type: 'x'
    },
    backgroundColor: '#222222'
  },
  title: {
    text: ''
  },
  subtitle: {
    text: document.ontouchstart === undefined ?
      'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
  },
  legend: {
    enabled: true,
    itemHoverStyle: {
      color: 'grey'
    },
    itemStyle: {
      color: 'white',
    }
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

const axisDefaults = {
  // Axis lines
  lineColor: 'white',
  lineWidth: 2,
  // Major grid lines
  gridLineWidth: 1,
  gridLineColor: 'grey',
  // Minor grid lines
  minorTickInterval: 'auto',
  minorTickColor: 'grey',
  minorGridLineColor: 'grey',
  minorGridLineWidth: 0.5,
  // Axis labels
  labels: {
    style: {
      color: 'white'
    }
  },
  // Axis title
  title: {
    style: {
      color: 'white',
      fontWeight: 'bold',
    }
  }
};

const getStandardChartConfig = (chartInformation: ChartInformation) => {

  const chartConfig = defaultChartOptions;

  chartConfig.chart = {
    type: chartInformation.type,
    zooming: {
      type: 'x'
    }
  };

  chartConfig.tooltip = { 
    xDateFormat: chartInformation.hasGPSTime ? '%A, %b %e, %Y %H:%M:%S.%L' : '%H:%M:%S.%L'
  };

  chartConfig.xAxis = {
    ...axisDefaults,
    title: {
      ...axisDefaults.title,
      text: chartInformation.files[0].x.header
    },

    dateTimeLabelFormats: {
      day: '%H:%M', // Removes stating the date, instead only shows the time
    },

    type: chartInformation.hasTimestampX ? 'datetime' : 'linear',
  } as Highcharts.XAxisOptions;;

  chartConfig.yAxis = {
    ...axisDefaults,
    title: {
      ...axisDefaults.title,
      text: chartInformation.files[0].y.header,
    },
  } as Highcharts.YAxisOptions;;

  return chartConfig;
};

const getDefaultChartConfig = (chartInformation, parsedData, fileNames) => {
  const chartConfig = getStandardChartConfig(chartInformation);
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

  chartConfig.colorAxis = {showInLegend: false};

  return chartConfig;
};

const getVideoChartConfig = (chartInformation, parsedData, fileNames) => {
  const chartConfig = getDefaultChartConfig(chartInformation, parsedData, fileNames);

  chartConfig.chart = {type: 'line'};

  chartConfig.boost = {enabled: chartInformation.hasTimestampX};

  chartConfig.xAxis = {plotLines: [{
    color: 'red',
    width: 2,
    zIndex: 3,
  }]};

  chartConfig.yAxis = {plotLines: [{
    color: 'red',
    width: 2,
    zIndex: 3,
  }]};

  return chartConfig;
};

const getColourChartConfig = (chartInformation, parsedData, fileNames, minMax) => {
  const chartConfig = getStandardChartConfig(chartInformation);

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
    min: minMax,
    max: minMax,
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