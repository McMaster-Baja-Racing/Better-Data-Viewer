export interface FileInformation {
  key: string;
  name: string;
  extension: string;
  headers: string[];
  size: number;
  date: Date;
  start: Date;
  end: Date;
}

export type RawFileInformation = Omit<FileInformation, 'date' | 'start' | 'end'> 
  & { date: string; start: string; end: string };

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
  AVERAGE = 'AVERAGE',
  CUBIC = 'CUBIC',
  LINEAR_MULTIPLY = 'LINEAR_MULTIPLY',
  RDP_COMPRESSION = 'RDP_COMPRESSION',
  ROLL_AVG = 'ROLL_AVG',
  SGOLAY = 'SGOLAY',
  SPLIT = 'SPLIT',
  DELETE_OUTLIER = 'DELETE_OUTLIER',
  STRICT_TIMESTAMP = 'STRICT_TIMESTAMP',
  SMOOTH_STRICT_PRIM = 'SMOOTH_STRICT_PRIM',
  SMOOTH_STRICT_SEC = 'SMOOTH_STRICT_SEC',
}

export const getDataTypes = (files?: FileInformation[], selectedSource?: string): string[] => {
  if (!files || files.length === 0 || !selectedSource?.trim()) {
    return [];  
  }
  
  const sourceFiles = files.filter(file => file.key?.includes(selectedSource));
  
  if (sourceFiles.length === 0) {
    return [];  
  }
  
  const allDataTypes = sourceFiles.flatMap(file => file.headers);
  const uniqueDataTypes = [...new Set(allDataTypes)];
  return uniqueDataTypes.sort();
};

export type DataTypes = string;
