import { AnalyzerType } from '@types';
import { Series } from 'highcharts';

export interface ChartInformation {
  files: ChartFileInformation[];
  live: boolean;
  type: chartType;
  hasGPSTime: boolean;
  hasTimestampX: boolean;
}

export enum chartType {
  scatter = 'scatter',
  line = 'line',
  coloredline = 'coloredline',
  video = 'video',
  datetime = 'datetime',
  // video = 'video'
}

export interface ChartFileInformation {
  x: Column;
  y: Column;
  z: Column | null;
  analyze: ChartAnalyzerInformation;
}

export const dataColumnKeys = ['x', 'y', 'z'] as const;

export type DataColumnKey = typeof dataColumnKeys[number];

export interface ChartAnalyzerInformation {
  type: AnalyzerType | null;
  analyzerValues: string[];
}

export interface Column {
  header: string;
  filename: string;
  timespan: {
    start: Date | null;
    end: Date | null;
  };
}

export interface ColourSeriesData {
  x: number;
  y: number;
  colorValue: number;
  segmentColor: string;
}

export interface HeadersIndex {
  x: number;
  y: number;
  colour: number;
}

export type seriesData = ColourSeriesData[] | number[][];

// Some highcharts bs here
// See https://www.highcharts.com/forum/viewtopic.php?t=52926
export interface ExtSeries extends Series {
  xData: number[];
  yData: number[];
}
