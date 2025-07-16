
export interface FileInformation {
  key: string;
  name: string;
  extension: string;
  headers: string[];
  size: number;
  date: Date; // TODO: Change to Date type
}

export type RawFileInformation = Omit<FileInformation, 'date'> & { date: string };

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
  STRICT_TIMESTAMP = 'STRICT_TIMESTAMP',
  SHIFT_CURVE = 'SHIFT_CURVE',
}

// Define the constant array with all valid values
export const dataTypesArray = [
  'Timestamp (ms)',
  'BATT PERC',
  'BATT VOLT',
  'BRAKE PRESS',
  'GPS ANGLE',
  'GPS DAY MONTH YEAR',
  'GPS LATITUDE',
  'GPS LONGITUDE',
  'GPS SECOND MINUTE HOUR',
  'GPS SPEED',
  'RPM PRIM',
  'RPM SEC'
] as const;

// Derive the union type from the array
export type DataTypes = typeof dataTypesArray[number];
