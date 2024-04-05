// Computs the offsets between the videoStart and the fileStart for all series
export const computeOffsets = (chartInformation, video) => {
  const videoStart = new Date(video.start).getTime();
        
  const tempOffsets = [];
  chartInformation.files.forEach(file => {
    const fileStart = new Date(file.columns[0].timespan.start).getTime(); // Unix date of first timestamp in file
    tempOffsets.push(videoStart - fileStart);
  });
  return tempOffsets;
};

export const getPointIndex = (series, videoTimestamp, offset, timestamps) => {
  const fileTimestamp = getFileTimestamp(videoTimestamp, offset, timestamps);
  if (fileTimestamp === undefined) return;
  const timestampIndex = findClosestTimestamp(fileTimestamp, timestamps);
  const pointIndex = findPointIndex(timestampIndex, series);
  return pointIndex;
};

export const getFileTimestamp = (videoTimestamp, offset, timestamps) => {
  const fileTimestamp = videoTimestamp + offset + timestamps[0];
  if (fileTimestamp < timestamps[0] || fileTimestamp > timestamps[timestamps.length - 1]) return;
  return fileTimestamp;
};

// Filters the given list of files to only include those that have timespans that overlap with the video
export const filterFiles = (video, files, fileTimespans) => {
  const videoSyncFiles = [];
  const videoStart = new Date (video.start);
  const videoEnd = new Date (video.end);
  files.forEach(file => {
    const fileTimespan = fileTimespans.find(timespan => timespan.key === file.key);
    if (fileTimespan === undefined) return;
    const fileStart = new Date(fileTimespan.start);
    const fileEnd = new Date(fileTimespan.end);
    if (fileStart < videoEnd && videoStart < fileEnd) videoSyncFiles.push(file);
  });
  return videoSyncFiles;
};

// Finds the index of the timestamp in array that is closest to the timestamp provided
const findClosestTimestamp = (targetTimestamp, timestampArray) => {
  const closestTimestamp = timestampArray.reduce((prev, curr) => {
    return Math.abs(curr - targetTimestamp) < Math.abs(prev - targetTimestamp) ? curr : prev;
  });
  return timestampArray.indexOf(closestTimestamp);
};

// Finds the index of the point of the on screen series 
// that matches with the point at the same index as the one provided
const findPointIndex = (timestampIndex, series) => {
  const timestampPoint = {x: series.xData[timestampIndex], y: series.yData[timestampIndex]};
  const point = series.points.find(point => point.x === timestampPoint.x && point.y === timestampPoint.y);
  return series.points.indexOf(point);
};