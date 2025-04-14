
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

// Define the constant array with all valid values
export const dataTypesArray = [
  "BATT PERC",
  "BATT VOLT",
  "BRAKE PRES",
  "GPS ANGLE",
  "GPS DAY MONTH YEAR",
  "GPS LATITUDE",
  "GPS LONGITUDE",
  "GPS SECOND MINUTE HOUR",
  "GPS SPEED",
  "PRM PRIM",
  "PRM SEC"
] as const;

// Derive the union type from the array
export type DataTypes = typeof dataTypesArray[number];