import { Options } from 'highcharts';
import { ChartInfo, GraphType } from '../types/ChartInfo';

export const defaultChartOptions: Options = {
  chart: {
    type: 'scatter',
    zooming: { 
      type: 'x' 
    },
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

const getStandardChartConfig = (chartInformation: ChartInfo): Options => {

  const chartConfig = defaultChartOptions;

  if (chartConfig.title) chartConfig.title.text = chartInformation.files[0].columns[1].header + 
                                                  ' vs ' + 
                                                  chartInformation.files[0].columns[0].header;

  chartConfig.chart = {
    type: chartInformation.type,
    zooming: { 
      type: 'x' 
    },
  };

  chartConfig.tooltip = { 
    xDateFormat: chartInformation.hasGPSTime ? '%A, %b %e, %Y %H:%M:%S.%L' : '%H:%M:%S.%L'
  };

  chartConfig.xAxis = {
    title: {
      text: chartInformation.files[0].columns[0].header
    },

    dateTimeLabelFormats: {
      day: '%H:%M', // Removes stating the date, instead only shows the time
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

const getDefaultChartConfig = (chartInformation: ChartInfo, parsedData: number[][], fileNames: string[]) => {
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
      marker: { enabled: false },
      type: chartInformation.type === GraphType.Scatter ? 'scatter' 
        : chartInformation.type === 'spline' ? 'spline' : 'line',
    };
  });

  return chartConfig;
};

const getVideoChartConfig = (chartInformation: ChartInfo, parsedData: number[][], fileNames: string[]) => {
  const chartConfig = getDefaultChartConfig(chartInformation, parsedData, fileNames);

  if (chartConfig.chart) chartConfig.chart.type = 'line';

  if (chartConfig.boost) chartConfig.boost.enabled = chartInformation.hasTimestampX;

  if (chartConfig.xAxis === undefined || Array.isArray(chartConfig.xAxis)) return chartConfig;
  if (chartConfig.yAxis === undefined || Array.isArray(chartConfig.yAxis)) return chartConfig;

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

const getColourChartConfig = (
  chartInformation: ChartInfo, 
  parsedData: number[][], 
  fileNames: string[], 
  minMax: number[]
) => {
  const chartConfig = getStandardChartConfig(chartInformation);

  chartConfig.series = parsedData.map((data, index) => {
    return {
      name: fileNames[index],
      data: data,
      color: 'colorValue',
      opacity: 1,
      turboThreshold: 0,
      findNearestPointBy: 'xy',
      type: 'line',
    };
  });

  chartConfig.colorAxis = {
    min: minMax[0],
    max: minMax[1],
    stops: [
      [0.1, '#20ff60'], // green
      [0.5, '#DDDF0D'], // yellow
      [0.9, '#ff0000'] // red
    ],
    showInLegend: true,
  };

  return chartConfig;
};

export const getChartConfig = (
  chartInformation: ChartInfo, 
  parsedData: number[][], 
  fileNames: string[], 
  minMax: number[]
) => {
  switch(chartInformation.type) {
    case 'coloredline': return getColourChartConfig(chartInformation, parsedData, fileNames, minMax);
    case 'video': return getVideoChartConfig(chartInformation, parsedData, fileNames);
    default: return getDefaultChartConfig(chartInformation, parsedData, fileNames);
  }
};

export const movePlotLineX = (chartOptions: Options, x: number) => {
  if (chartOptions.xAxis === undefined || Array.isArray(chartOptions.xAxis)) return chartOptions;
  return {
    ...chartOptions,
    xAxis: {
      ...chartOptions.xAxis,
      plotLines: [{ ...chartOptions.xAxis?.plotLines?.[0], value: x }],
    },
  };
};

export const movePlotLines = (chartOptions: Options, x: number, y: number) => {
  if (chartOptions.xAxis === undefined || Array.isArray(chartOptions.xAxis)) return chartOptions;
  if (chartOptions.yAxis === undefined || Array.isArray(chartOptions.yAxis)) return chartOptions;
  return {
    ...chartOptions,
    xAxis: {
      ...chartOptions.xAxis,
      plotLines: [{ ...chartOptions.xAxis.plotLines, value: x }],
    },
    yAxis: {
      ...chartOptions.yAxis,
      plotLines: [{ ...chartOptions.yAxis.plotLines, value: y }],
    },
  };
};