// Finds the index of the timestamp in array that is closest to the timestamp provided
export const findClosestTimestamp = (targetTimestamp, timestampArray) => {
    const closestTimestamp = timestampArray.reduce((prev, curr) => Math.abs(curr - targetTimestamp) < Math.abs(prev - targetTimestamp) ? curr : prev)
    return timestampArray.indexOf(closestTimestamp)
}

// Finds the index of the point of the on screen series that matches with the point at the same index as the one provided
export const findPointIndex = (timestampIndex, series) => {
    const timestampPoint = {x: series.xData[timestampIndex], y: series.yData[timestampIndex]}
    const point = series.points.find(point => point.x === timestampPoint.x && point.y === timestampPoint.y)
    return series.points.indexOf(point)
}