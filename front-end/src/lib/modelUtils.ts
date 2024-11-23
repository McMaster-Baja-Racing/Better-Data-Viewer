import { quatReplayData, ReplayEvent, ReplayEventType, StateType } from '@types';
import { ApiUtil } from './apiUtils';
import { Quaternion, Euler } from 'three';

const extractColumn = (data, columnIndex = 1) => {
  return data.map(row => row[columnIndex]);
};

const parseCSV = (data: string) => {
  return data
    .trim()
    .split('\n')
    .slice(1)
    .map(row => row.split(',')); 
};

const combineData = (timestamps, x, y, z, w) => {
  return timestamps.map((timestamp: string, i: number) => ({
    timestamp: Number(timestamp),
    x: Number(x[i]),
    y: Number(y[i]),
    z: Number(z[i]),
    w: Number(w[i])
  }));
};

export const fetchData = async (bin: string) => {
  let data: quatReplayData = [];
  await Promise.all([
    ApiUtil.getFile(`${bin}/IMU QUAT W.csv`),
    ApiUtil.getFile(`${bin}/IMU QUAT X.csv`),
    ApiUtil.getFile(`${bin}/IMU QUAT Y.csv`),
    ApiUtil.getFile(`${bin}/IMU QUAT Z.csv`)
  ]).then(([wDataRaw, xDataRaw, yDataRaw, zDataRaw]) => {
    const wData = parseCSV(wDataRaw);
    const xData = parseCSV(xDataRaw);
    const yData = parseCSV(yDataRaw);
    const zData = parseCSV(zDataRaw);

    const w = extractColumn(wData);
    const x = extractColumn(xData);
    const y = extractColumn(yData);
    const z = extractColumn(zData);
    const timestamps = extractColumn(wData, 0);

    data = combineData(timestamps, x, y, z, w);
  });
  return data;
};

const updateQuaternion = (quat: Quaternion, objRef: THREE.Group) => {
  if (objRef) {
    objRef.quaternion.set(quat.x, quat.y, quat.z, quat.w);
  }
};

const updateEuler = (euler: Euler, objRef: THREE.Group) => {
  if (objRef) {
    objRef.rotation.set(euler.x, euler.y, euler.z);
  }
};

export class ModelReplayController {
  private data: quatReplayData;
  private objRef: THREE.Group;
  private isPlaying = false;
  private currentIndex = 0;
  private lastTimestamp = 0;
  private startTime = 0;
  private angleMode: 'quaternion' | 'euler';
  private speed = 1;
  private listeners: ((event: ReplayEvent) => void)[] = [];

  constructor(
    data: quatReplayData, 
    objRef: THREE.Group, 
    angleMode: 'quaternion' | 'euler' = 'quaternion',
  ) {
    this.data = data;
    this.objRef = objRef;
    this.angleMode = angleMode;
  }

  // Here we setup event listeners to allow other components to listen in on the state of the replaying

  // This allows users to subscribe to events
  on(eventHandler: (event: ReplayEvent) => void) {
    this.listeners.push(eventHandler);
  }

  // This allows users to unsubscribe from events
  off(eventHandler: (event: ReplayEvent) => void) {
    this.listeners = this.listeners.filter((handler) => handler !== eventHandler);
  }

  // This allows us to set the state of the replaying
  private emit(event: ReplayEvent) {
    this.listeners.forEach((handler) => handler(event));
  }

  // Below is the state machine functionality for the replaying

  play() {
    if (this.isPlaying) return;
    this.emit({ type: ReplayEventType.StateChanged, state: StateType.Playing });
    this.isPlaying = true;

    // Initialize start time if playing from the beginning
    if (this.currentIndex === 0) {
      this.startTime = performance.now();
    } else {
      // Adjust the start time for resuming from the current index
      this.startTime = performance.now() - this.lastTimestamp / this.speed;
    }

    this.loop();
  }

  pause() {   
    this.isPlaying = false;
    this.emit({ type: ReplayEventType.StateChanged, state: StateType.Paused });
  }

  stop() {
    this.isPlaying = false;
    this.emit({ type: ReplayEventType.StateChanged, state: StateType.Stopped });
  }

  reset() {
    this.pause();
    this.currentIndex = 0;
    this.lastTimestamp = 0;
  }

  setSpeed(newSpeed: number) {
    if (newSpeed <= 0) {
      console.warn('Speed must be positive. Ignoring invalid value:', newSpeed);
      return;
    }
    this.speed = newSpeed;
  }

  private loop() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const elapsed = (now - this.startTime) * this.speed;

    while (
      this.currentIndex < this.data.length &&
      this.data[this.currentIndex].timestamp <= elapsed
    ) {
      const { x, y, z, w, timestamp } = this.data[this.currentIndex];
      updateQuaternion(new Quaternion(x, y, z, w), this.objRef);

      this.emit({
        type: ReplayEventType.Progress,
        currentIndex: this.currentIndex,
        timestamp,
      });

      this.lastTimestamp = timestamp;
      this.currentIndex++;
    }

    if (this.currentIndex >= this.data.length) {
      this.stop();
      this.emit({ type: ReplayEventType.Finished });
      return;
    }

    // Continue the loop
    requestAnimationFrame(this.loop.bind(this));
  }
}

