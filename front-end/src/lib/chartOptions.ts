import { Options, XAxisOptions } from 'highcharts';

const axisDefaults: Partial<XAxisOptions> = {
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
  },
  dateTimeLabelFormats: {
    day: '%H:%M', // Removes stating the date, instead only shows the time
  },
  // TODO: Placeholder to remember, will move to dashboard settings
  // eslint-disable-next-line no-constant-condition
  type: false ? 'datetime' : 'linear',
};

export const defaultChartOptions: Options = {
  chart: {
    type: 'scatter',
    zooming: {
      type: 'x'
    },
    backgroundColor: '#222222',
  },
  title: {
    text: '',
    style: { display: 'none' } // Hide chart title completely
  },
  subtitle: {
    text: document.ontouchstart === undefined ?
      'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
  },
  xAxis: {
    ...axisDefaults
  },
  yAxis: {
    ...axisDefaults
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
  },
  tooltip: {
    // TODO: Placeholder to remember, will move to dashboard settings
    // eslint-disable-next-line no-constant-condition
    xDateFormat: true ? '%A, %b %e, %Y %H:%M:%S.%L' : '%H:%M:%S.%L'
  },
};

// TODO: Remove this
const getDefaultChartConfig = (parsedData, fileNames) => {
  const chartConfig = defaultChartOptions;
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

// TODO: Remove this
const getVideoChartConfig = (parsedData, fileNames) => {
  const chartConfig = getDefaultChartConfig(parsedData, fileNames);

  chartConfig.chart = {type: 'line'};

  //chartConfig.boost = {enabled: chartInformation.hasTimestampX};

  chartConfig.xAxis = {plotLines: [{
    color: 'black',
    width: 2,
    zIndex: 3,
  }]};

  chartConfig.yAxis = {plotLines: [{
    color: 'black',
    width: 2,
    zIndex: 3,
  }]};

  return chartConfig;
};

// TODO: Remove this
const getColourChartConfig = (parsedData, fileNames, minMax) => {
  const chartConfig = defaultChartOptions;

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

export const getChartConfig = (parsedData, fileNames, minMax) => {
  // TODO: Remove this
  const chartInformation = { type: 'default' }; // Default chart type
  switch(chartInformation.type) {
    case 'coloredline': return getColourChartConfig(parsedData, fileNames, minMax);
    case 'video': return getVideoChartConfig(parsedData, fileNames);
    default: return getDefaultChartConfig(parsedData, fileNames);
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