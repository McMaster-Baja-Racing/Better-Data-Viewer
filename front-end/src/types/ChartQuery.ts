import { AnalyzerType } from '@types';

export interface Series {
  x: Column;
  y: Column;
  analyzer: Analyzer;
}

export interface Column {
  source: string;
  dataType: string;
}

export interface Analyzer {
  type: AnalyzerType | null;
  options: string[];
}
