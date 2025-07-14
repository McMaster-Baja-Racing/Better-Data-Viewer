import { AnalyzerType } from '@types';

export interface seriesT {
  x: columnT;
  y: columnT;
  analyzer: analyzerT;
}

export interface columnT {
  filename: string;
  header: string;
}

export interface analyzerT {
  type: AnalyzerType | null;
  options: string[];
}