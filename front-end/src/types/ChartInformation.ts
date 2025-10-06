import { Options, Series, SeriesLineOptions, SeriesOptionsType } from 'highcharts';

export type ChartType = SeriesOptionsType['type'] | 'coloredLine';

export const chartTypeMap: {value: ChartType, label: string}[] = [
  { value: 'line', label: 'Line' },
  { value: 'spline', label: 'Spline' },
  { value: 'area', label: 'Area' },
  { value: 'areaspline', label: 'Area Spline' },
  { value: 'scatter', label: 'Scatter' },
  { value: 'column', label: 'Column' },
  { value: 'bar', label: 'Bar' },
  { value: 'coloredLine', label: 'Colored Line' },
];

export const dataColumnKeys = ['x', 'y'] as const;

export type DataColumnKey = typeof dataColumnKeys[number];

export interface ColourSeriesData {
  x: number;
  y: number;
  colorValue: number;
  segmentColor: string;
}

export type seriesData = ColourSeriesData[] | number[][];

// Some highcharts bs here
// See https://www.highcharts.com/forum/viewtopic.php?t=52926
export interface ExtSeries extends Series {
  xData: number[];
  yData: number[];
}

// More highcharts stuff, adding colour series
// Custom coloredLine series type
export interface ColoredLineSeriesOptions extends Omit<SeriesLineOptions, 'type'> {
  type: 'coloredLine';
}

// Extended series type that includes our custom coloredLine type
export type ExtendedSeriesOptionsType = SeriesOptionsType | ColoredLineSeriesOptions;

// Extended Options type that uses our custom series type
export interface CustomOptions extends Omit<Options, 'series'> {
  series?: ExtendedSeriesOptionsType[];
}
