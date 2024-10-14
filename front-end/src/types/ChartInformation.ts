import { AnalyzerType } from '@types';
import { Series } from 'highcharts';

export interface ChartInformation {
  files: {
    columns: Column[];
    analyze: {
      type: AnalyzerType;
      analyzerValues: string[];
    }
  }[];
  live: boolean;
  type: string;
  hasGPSTime: boolean;
  hasTimestampX: boolean;
}

export interface Column {
  header: string;
  filename: string;
  timespan: {
    start: Date;
    end: Date;
  }
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