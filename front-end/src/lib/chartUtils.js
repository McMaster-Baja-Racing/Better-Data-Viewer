import { ApiUtil } from './apiUtils';

// Constants for colour chart
const HUE_MIN = 150;
const HUE_MAX = 0;
export const LIVE_DATA_INTERVAL = 300;

/**
 * @description Fetches the data from the server and formats it for the chart.
 * @param {Object} response - The file response from the server.
 * @param {string} filename - The name of the file.
 * @param {Object[]} columns - The columns to be fetched.
 * @param {useRef<string[]>} minMax - The minimum and maximum values of the colour value.
 * @param {string} chartType - The type of chart.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of data objects.
 */
export const getSeriesData = async (text, filename, columns, minMax, chartType, dtformat) => {

  let headers = text.trim().split('\n')[0].split(',');
  headers[headers.length - 1] = headers[headers.length - 1].replace('\r', '');

  let headerIndices = getHeadersIndex(headers, columns);

  // Get all the lines of the file, and split them into arrays
  const lines = text.trim().split('\n').slice(1).map((line) => line.split(','));

  // If not colour, return values in array to allow for boost

  if (chartType !== 'coloredline') {
    const timestampOffset = dtformat === 'full' ? getTimestampOffset(columns, lines, headerIndices) : 0;
    return lines.map((line) => {
      return [parseFloat(line[headerIndices.x]) + timestampOffset, parseFloat(line[headerIndices.y])];
    });
  }

  // If colour, return the data in object format to allow for colouring
  // Make a request to get the maximum and minimum values of the colour value
  // TODO: Seems to break when giving it a file with 3+ colomns, worth looking into
  const minMaxResponse = await ApiUtil.getMinMax(filename, columns[columns.length -1].header);
  
  let [minval, maxval] =  JSON.parse(await minMaxResponse.text());
  minMax.current = [minval, maxval];

  return lines.map((line) => {

    let val = parseFloat(line[headerIndices.colour]);
    let hue = HUE_MIN + (HUE_MAX - HUE_MIN) * (val - minval) / (maxval - minval);

    return { 
      x: parseFloat(line[headerIndices.x]), 
      y: parseFloat(line[headerIndices.y]), 
      colorValue: val, 
      segmentColor: `hsl(${hue}, 100%, 50%)`
    };
  });
};

// Calculates the offset required to convert the x values to unix timestamps
// Adding the timestampOffset results in the x value being a the start time unix millis + millis since first timestamp
const getTimestampOffset = (columns, lines, headerIndices) => {
  // Offset is the start time in unix millis minus the first timestamp in the file
  return new Date(columns[headerIndices.x].timespan.start + 'Z').getTime() - parseFloat(lines[0][headerIndices.x]);
};

export const getTimestamps = async (text) => {
  const timestampHeaderIndex = text.trim().split('\n')[0].split(',').indexOf('Timestamp (ms)');
  return text.trim().split('\n').slice(1).map((line) => parseFloat(line.split(',')[timestampHeaderIndex]));
};

/**
 * @description Matches headers to columns to get the indices of the columns in the headers array.
 * @param {string[]} headers - An array of headers.
 * @param {string[]} columns - An array of columns.
 * @returns {Object} An object with the indices of the columns in the headers array. The keys are 'x', 'y', and 'colour'
 */
const getHeadersIndex = (headers, columns) => {
  let h = {};
  for (let i = 0; i < columns.length; i++) {
    for (let j = 0; j < headers.length; j++) {
      if (columns[i].header === headers[j].trim()) {
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

/**
 * @param {Object} chartInformation - The chart information object.
 * @returns {Boolean} True if the chart information is full, false otherwise.
 */
export const validateChartInformation = (chartInformation) => {
  if (!chartInformation) {
    return false;
  }
  if (chartInformation.files.length === 0) {
    return false;
  }
  if (chartInformation.files[0].columns.length === 0) {
    return false;
  }
  if (chartInformation.files[0].columns[0].header === '' || chartInformation.files[0].columns[0].filename === '') {
    return false;
  }
  return true;
};