import {LAT_INDEX, LNG_INDEX, TIME_INDEX, EXIT, ENTER} from './mapOptions';

export function getBounds(coords) {
  /**
     * Gets the bounding box that surrounds a list of coordinates
     * @param {Array} coords - a list of coordinates in [long, lat] format
     */
  let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
  coords.forEach(elem => {
    if (elem[LAT_INDEX] > maxLat) maxLat = elem[LAT_INDEX];
    if (elem[LAT_INDEX] < minLat) minLat = elem[LAT_INDEX];
    if (elem[LNG_INDEX] > maxLng) maxLng = elem[LNG_INDEX];
    if (elem[LNG_INDEX] < minLng) minLng = elem[LNG_INDEX];
  });
  // Add some margin on sides so the line isn't right on the edge of the screen
  let latMargin = (maxLat - minLat) * 0.5;
  let lngMargin = (maxLng - minLng) * 0.5;
  let bounds = [[minLat - latMargin, minLng - lngMargin], [maxLat + latMargin, maxLng + lngMargin]];
  // console.log("Boudns are:", bounds, minLat, maxLat, minLng, maxLng)
  // console.log("coords is:", coords);
  return bounds;
}

export function boundaryEvent(event, rect, time) {
  return { event: event, rect: rect, time: time };
}

export function pointInRect(point, bounds) {
  if (!bounds) return false;
  if (!point) return false;
  let px = point[0];
  let py = point[1];
  let b1x = bounds[0][0];
  let b1y = bounds[0][1];
  let b2x = bounds[1][0];
  let b2y = bounds[1][1];

  if (px > Math.min(b1x, b2x) && px < Math.max(b1x, b2x)) {
    if (py > Math.min(b1y, b2y) && py < Math.max(b1y, b2y)) {
      return true;
    }
  }
  return false;
}

export function findLapTimes(coords, rects) {
  let inside = false;
  let events = [];
  for (let i = 0; i < coords.length; i++) {
    for (let [index, elem] of rects.entries()) {
      if (!inside && pointInRect([coords[i][LAT_INDEX], coords[i][LNG_INDEX]], elem.bounds)) {
        inside = true;
        events.push(boundaryEvent(ENTER, index, coords[i][TIME_INDEX]));
      }
      else if (inside && events[events.length - 1].rect === index 
        && !pointInRect([coords[i][LAT_INDEX], coords[i][LNG_INDEX]], elem.bounds)) 
      {
        inside = false;
        events.push(boundaryEvent(EXIT, index, coords[i][TIME_INDEX]));
      }
    }
  }
  let laps = [];
  let currLap = { start: 0, end: 0, checkpoints: [] };
  let visitedCheckpoints = [];
  for (let event of events) {
        
    if (event.event === EXIT && rects[event.rect].type === 'Start') {
      currLap.start = event.time;
      // console.log(event.time + ": Start lap");
    }
    else if (event.event === ENTER && rects[event.rect].type === 'End') {
      currLap.end = event.time;
      laps.push(currLap);
      // console.log(event.time + ": End lap time: " + (currLap.end - currLap.start) / 1000 + "s");
      currLap = { start: 0, end: 0, checkpoints: [] };
      visitedCheckpoints = [];
    }
    else if (event.event === ENTER && rects[event.rect].type === 'Checkpoint') {
      if (!visitedCheckpoints.includes(event.rect)) {
        currLap.checkpoints.push(event.time);
        visitedCheckpoints.push(event.rect);
        // console.log(event.time + ": Checkpoint");
        console.log(visitedCheckpoints, event.rect);
      }
    }
    // console.log(event.time, ": " +event.event + " " + rects[event.rect].type + " " + event.rect);
  }
  return laps;
}