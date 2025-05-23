
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
  STRICT_TIMESTAMP = 'STRICT_TIMESTAMP',
  SHIFT_CURVE = 'SHIFT_CURVE',
}

// Define the constant array with all valid values
export const dataTypesArray = [
  "BATT_PERC",
  "BATT_VOLT",
  "BRAKE PRES",
  "GPS_ANGLE",
  "GPS_DAY_MONTH_YEAR",
  "GPS_LATITUDE",
  "GPS_LONGITUDE",
  "GPS_SECOND_MINUTE_HOUR",
  "GPS_SPEED",
  "RPM_PRIM",
  "RPM_SEC"
] as const;

// Derive the union type from the array
export type DataTypes = typeof dataTypesArray[number];
