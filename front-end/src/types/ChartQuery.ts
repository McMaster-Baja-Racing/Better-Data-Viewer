import { AnalyzerType } from '@types';

export interface seriesT {
  x: columnT;
  y: columnT;
  analyzer: analyzerT;
}

export interface columnT {
  source: string;
  dataType: string;
}

export interface analyzerT {
  type: AnalyzerType | null;
  options: string[];
}

// Simplified series for smart analyzer
export interface smartSeriesT {
  xDataType: string;
  yDataType: string;
  xSource: string;
  ySource: string;
  analyzer: analyzerT;
}