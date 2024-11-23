import { quatReplayData } from 'types/ModelTypes';
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
    //meshRef.current.rotation.set(x, y, z)
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

  constructor(data: quatReplayData, objRef: THREE.Group, angleMode: 'quaternion' | 'euler') {
    this.data = data;
    this.objRef = objRef;
    this.angleMode = angleMode;
  }

  play() {
    if (this.isPlaying) return; // Already playing
    console.log('Replay started.');
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
    console.log('Replay paused.');
  }

  stop() {
    this.isPlaying = false;
    console.log('Replay finished.');
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
    console.log('Replay speed set to:', this.speed);
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
      console.log('Replaying timestamp: ', timestamp);
      updateQuaternion(new Quaternion(x, y, z, w), this.objRef);
      this.lastTimestamp = timestamp;
      this.currentIndex++;
    }

    if (this.currentIndex >= this.data.length) {
      this.stop();
      return;
    }

    // Continue the loop
    requestAnimationFrame(this.loop.bind(this));
  }
}

