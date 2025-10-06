import { FileInformation } from '@types';
import { Column, Series } from 'types/ChartQuery';

export const HUE_MIN = 150;
export const HUE_MAX = 0;
export const LIVE_DATA_INTERVAL = 300;

// Returns the offset in milliseconds between the start time of the file and the first timestamp in the file
// Adding the timestampOffset results in the x value being a the start time unix millis + millis since first timestamp
export const getTimestampOffsetFromFile = (fileInfo: FileInformation, firstTimestamp: number): number => {
  if (!fileInfo.start) return 0;
  return new Date(fileInfo.start).getTime() - firstTimestamp;
};

export const getTimestamps = async (text: string) => {
  const timestampHeaderIndex = text.trim().split('\n')[0].split(',').indexOf('Timestamp (ms)');
  return text.trim().split('\n').slice(1).map((line) => parseFloat(line.split(',')[timestampHeaderIndex]));
};

/**
 * @description Matches headers to columns to get the indices of the columns in the headers array.
 * @returns {Object} An object with the indices of the columns in the headers array. The keys are 'x', 'y', and 'colour'
 */
export const getHeadersIndex = (headers: string[], columns: Column[]) => {
  const h = { x: -1, y: -1, colour: -1 };
  for (let i = 0; i < columns.length; i++) {
    if (!columns[i] || !columns[i].dataType) {
      console.warn(`Invalid column at index ${i}:`, columns[i]);
      continue;
    }
    
    for (let j = 0; j < headers.length; j++) {
      if (!headers[j]) {
        continue;
      }
      
      if (columns[i].dataType.trim() === headers[j].trim()) {
        if (i === 0) {
          h.x = j;
        } else if (i === 1) {
          h.y = j;
        } else if (i === 2) {
          h.colour = j;
        }
      }
    }
  }
  return h;
};

export const validateChartQuery = (series: Series[]) => {
  if (!series || series.length === 0) {
    return false;
  }
  
  // Filter out incomplete series - Y source can be auto-populated from X
  const completeSeries = series.filter(s => 
    s.x && s.y && 
    s.x.source && s.x.source.trim() !== '' && 
    s.x.dataType && s.x.dataType.trim() !== '' &&
    s.y.dataType && s.y.dataType.trim() !== ''
  );
  
  // We need at least one complete series
  return completeSeries.length > 0;
};