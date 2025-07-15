import { FileInformation, FileTimespan, ExtSeries } from '@types';

// Computs the offsets between the videoStart and the fileStart for all series
export const computeOffsets = (series, videoTimespan: FileTimespan) => {
  const videoStart = new Date(videoTimespan.start).getTime();

  const tempOffsets: number[] = [];
  series.files.forEach(file => {
    if(file.x.timespan.start == null)
    {
      // TODO: Decide when should a file require a timespan and when it's okay to be missing
      // throw new Error('File has no timespan start')
      return;
    }
    const fileStart = new Date(file.x.timespan.start).getTime(); // Unix date of first timestamp in file
    tempOffsets.push(videoStart - fileStart);
  });
  return tempOffsets;
};

export const getPointIndex = (series: ExtSeries, videoTimestamp: number, offset: number, timestamps: number[]) => {
  const fileTimestamp = getFileTimestamp(videoTimestamp, offset, timestamps);
  if (fileTimestamp === undefined) return;
  const timestampIndex = findClosestTimestamp(fileTimestamp, timestamps);
  const pointIndex = findPointIndex(timestampIndex, series);
  return pointIndex;
};

// TODO: Error handling instead of null return here?
export const getFileTimestamp = (videoTimestamp: number, offset: number, timestamps: number[]) => {
  const fileTimestamp = videoTimestamp + offset + timestamps[0];
  if (fileTimestamp < timestamps[0] || fileTimestamp > timestamps[timestamps.length - 1]) {
    throw new Error('Timestamp out of bounds');
  }
  return fileTimestamp;
};

// Filters the given list of files to only include those that have timespans that overlap with the video
export const filterFiles = (videoTimespan: FileTimespan, files: FileInformation[], fileTimespans: FileTimespan[]) => {
  const videoSyncFiles: FileInformation[] = [];
  const videoStart = new Date (videoTimespan.start);
  const videoEnd = new Date (videoTimespan.end);
  files.forEach(file => {
    const fileTimespan = fileTimespans.find(timespan => timespan.key === file.key);
    if (fileTimespan === undefined) return;
    const fileStart = new Date(fileTimespan.start);
    const fileEnd = new Date(fileTimespan.end);
    if (fileStart < videoEnd && videoStart < fileEnd) videoSyncFiles.push(file);
  });
  return videoSyncFiles;
};

export const binarySearchClosest = (arr: number[], target: number) => {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // At this point, 'left' is the index of the smallest element > target
  // and 'right' is the index of the largest element < target
  if (right < 0) return left; // target is smaller than all elements
  if (left >= arr.length) return right; // target is larger than all elements

  // Determine the closest element to the target
  return Math.abs(arr[left] - target) < Math.abs(arr[right] - target) ? left : right;
};

// Finds the index of the timestamp in array that is closest to the timestamp provided
const findClosestTimestamp = (targetTimestamp: number, timestampArray: number[]) => {
  const closestTimestamp = timestampArray.reduce((prev, curr) => {
    return Math.abs(curr - targetTimestamp) < Math.abs(prev - targetTimestamp) ? curr : prev;
  });
  return timestampArray.indexOf(closestTimestamp);
};

// Finds the index of the point of the on screen series 
// that matches with the point at the same index as the one provided
const findPointIndex = (timestampIndex: number, series: ExtSeries) => {
  const timestampPoint = {x: series.xData[timestampIndex], y: series.yData[timestampIndex]};
  const point = series.points.find(point => point.x === timestampPoint.x && point.y === timestampPoint.y);
  if (point === undefined) return -1;
  return series.points.indexOf(point);
};