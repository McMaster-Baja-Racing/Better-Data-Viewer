import { Column, HeadersIndex } from '@types';
import { columnT, seriesT } from 'types/ChartQuery';

export const HUE_MIN = 150;
export const HUE_MAX = 0;
export const LIVE_DATA_INTERVAL = 300;

// Calculates the offset required to convert the x values to unix timestamps
// Adding the timestampOffset results in the x value being a the start time unix millis + millis since first timestamp
export const getTimestampOffset = (columns: Column[], lines: string[][], headerIndices: HeadersIndex): number => {
  // Offset is the start time in unix millis minus the first timestamp in the file
  return new Date(columns[headerIndices.x].timespan.start + 'Z').getTime() - parseFloat(lines[0][headerIndices.x]);
};

export const getTimestamps = async (text: string) => {
  const timestampHeaderIndex = text.trim().split('\n')[0].split(',').indexOf('Timestamp (ms)');
  return text.trim().split('\n').slice(1).map((line) => parseFloat(line.split(',')[timestampHeaderIndex]));
};


/**
 * @description Matches headers to columns to get the indices of the columns in the headers array.
 * @returns {Object} An object with the indices of the columns in the headers array. The keys are 'x', 'y', and 'colour'
 */
export const getHeadersIndex = (headers: string[], columns: Column[] | columnT[]): HeadersIndex => {
  const h: HeadersIndex = { x: -1, y: -1, colour: -1 };
  for (let i = 0; i < columns.length; i++) {
    for (let j = 0; j < headers.length; j++) {
      if (columns[i].header.trim() === headers[j].trim()) {
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

export const validateChartQuery = (series: seriesT[]) => {
  if (!series || series.length === 0) {
    return false;
  }
  for (const s of series) {
    if (!s.x || !s.y) {
      return false;
    }
    if (s.x.header === '' || s.x.filename === '') {
      return false;
    }
  }
  return true;
};