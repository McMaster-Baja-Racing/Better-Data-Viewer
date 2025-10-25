import { replayData, ReplayEvent, ReplayEventType, StateType } from '@types';
import { ApiUtil } from './apiUtils';
import { Quaternion, Euler, ArrowHelper, Vector3 } from 'three';

const extractColumnData = (data: string[][], columnIndex = 1) => {
  return data.map(row => row[columnIndex]);
};

const parseCSV = (data: string) => {
  return data
    .trim()
    .split('\n')
    .slice(1)
    .map(row => row.split(',')); 
};

const combineData = (
  timestamps: string[],
  x: string[],
  y: string[],
  z: string[],
  w: string[],
  accelX: string[],
  accelY: string[],
  accelZ: string[],
) => {
  return timestamps.map((timestamp, i) => ({
    timestamp: Number(timestamp),
    x: Number(x[i]),
    y: Number(y[i]),
    z: Number(z[i]),
    w: Number(w[i]),
    accelX: Number(accelX[i]),
    accelY: Number(accelY[i]),
    accelZ: Number(accelZ[i]),
  }));
};

// TODO: Handle errors better
export const fetchData = async (bin: string) => {
  let data: replayData = [];
  await Promise.all([
    ApiUtil.getFileAsText(`${bin}/IMU QUAT W.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU QUAT X.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU QUAT Y.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU QUAT Z.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU ACCEL X.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU ACCEL Y.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU ACCEL Z.csv`),
  ]).then(([wDataRaw, xDataRaw, yDataRaw, zDataRaw, accelXDataRaw, accelYDataRaw, accelZDataRaw]) => {
    const wData = parseCSV(wDataRaw);
    const xData = parseCSV(xDataRaw);
    const yData = parseCSV(yDataRaw);
    const zData = parseCSV(zDataRaw);
    const accelXData = parseCSV(accelXDataRaw);
    const accelYData = parseCSV(accelYDataRaw);
    const accelZData = parseCSV(accelZDataRaw);

    const w = extractColumnData(wData);
    const x = extractColumnData(xData);
    const y = extractColumnData(yData);
    const z = extractColumnData(zData);
    const timestamps = extractColumnData(wData, 0);
    const accelX = extractColumnData(accelXData);
    const accelY = extractColumnData(accelYData);
    const accelZ = extractColumnData(accelZData);

    data = combineData(timestamps, x, y, z, w, accelX, accelY, accelZ);
  });
  return data;
};

const updateQuaternion = (quat: Quaternion, objRef: THREE.Group) => {
  if (objRef) {
    objRef.quaternion.set(quat.x, quat.y, quat.z, quat.w);
  }
};


// TODO: useEuler or remove
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateEuler = (euler: Euler, objRef: THREE.Group) => {
  if (objRef) {
    objRef.rotation.set(euler.x, euler.y, euler.z);
  }
};

export class ModelReplayController {
  private data: replayData;
  private objRef: THREE.Group;
  private isPlaying = false;
  private currentIndex = 0;
  private lastTimestamp = 0;
  private startTime = 0;
  private angleMode: 'quaternion' | 'euler';
  private speed = 1;
  private listeners: ((event: ReplayEvent) => void)[] = [];
  private accelVectors: {x: ArrowHelper; y: ArrowHelper; z: ArrowHelper; net: ArrowHelper;};
  private ARROW_LENGTH = 50;

  constructor(
    data: replayData,
    objRef: THREE.Group,
    angleMode: 'quaternion' | 'euler' = 'quaternion',
  ) {
    this.data = data;
    this.objRef = objRef;
    this.angleMode = angleMode;

    // Set up acceleration vectors
    this.accelVectors = {
      x: new ArrowHelper(new Vector3(1, 0, 0), new Vector3(0, 0, 0), this.ARROW_LENGTH, 0xff0000),
      y: new ArrowHelper(new Vector3(0, 1, 0), new Vector3(0, 0, 0), this.ARROW_LENGTH, 0x00ff00),
      z: new ArrowHelper(new Vector3(0, 0, 1), new Vector3(0, 0, 0), this.ARROW_LENGTH, 0x0000ff),
      net: new ArrowHelper((new Vector3(1, 1, 1)).normalize(), new Vector3(0, 0, 0), this.ARROW_LENGTH, 0x000000),
    };
    const scene = objRef.parent || objRef;
    Object.values(this.accelVectors).forEach(vec => scene.add(vec));
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
      // TODO: Remove debugging statement
      // eslint-disable-next-line no-console
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
      const { x, y, z, w, timestamp, accelX, accelY, accelZ } = this.data[this.currentIndex];
      updateQuaternion(new Quaternion(x, y, z, w), this.objRef);

      // Update acceleration arrows
      const xVec = new Vector3(accelX, 0, 0);
      const yVec = new Vector3(0, accelY, 0);
      const zVec = new Vector3(0, 0, accelZ);
      const netVec = new Vector3(accelX, accelY, accelZ);

      this.accelVectors.x.setDirection(xVec.clone().normalize());
      this.accelVectors.x.setLength(xVec.length() * this.ARROW_LENGTH);

      this.accelVectors.y.setDirection(yVec.clone().normalize());
      this.accelVectors.y.setLength(yVec.length() * this.ARROW_LENGTH);

      this.accelVectors.z.setDirection(zVec.clone().normalize());
      this.accelVectors.z.setLength(zVec.length() * this.ARROW_LENGTH);

      this.accelVectors.net.setDirection(netVec.clone().normalize());
      this.accelVectors.net.setLength(netVec.length() * this.ARROW_LENGTH);


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

