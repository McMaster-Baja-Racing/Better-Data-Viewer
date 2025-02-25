
export interface FileInformation {
  key: string;
  fileHeaders: string[];
  size: number;
}

export interface FileTimespan {
  key: string;
  start: Date;
  end: Date;
}

export interface MinMax {
  min: number;
  max: number;
}

export enum AnalyzerType {
  ACCEL_CURVE = 'ACCEL_CURVE',
  AVERAGE = 'AVERAGE',
  CUBIC = 'CUBIC',
  LINEAR_INTERPOLATE = 'LINEAR_INTERPOLATE',
  LINEAR_MULTIPLY = 'LINEAR_MULTIPLY',
  INTERPOLATER_PRO = 'INTERPOLATER_PRO',
  RDP_COMPRESSION = 'RDP_COMPRESSION',
  ROLL_AVG = 'ROLL_AVG',
  SGOLAY = 'SGOLAY',
  SPLIT = 'SPLIT',
  DELETE_OUTLIER = 'DELETE_OUTLIER',
}