import { replayData, ReplayEvent, ReplayEventType, StateType } from '@types';
import { ApiUtil } from './apiUtils';
import { Quaternion, Euler, ArrowHelper, Vector3, Box3, Sphere } from 'three';

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

const computeMaxAccel = (data: { accelX: number; accelY: number; accelZ: number }[]) => {
  let maxVal = -Infinity;

  for (const { accelX, accelY, accelZ } of data) {
    if (accelX > maxVal) maxVal = Math.abs(accelX);
    if (accelY > maxVal) maxVal = Math.abs(accelY);
    if (accelZ > maxVal) maxVal = Math.abs(accelZ);
  }

  // Avoid zero range
  if (maxVal === 0) maxVal = 1;

  return maxVal;
};

const updateQuaternion = (quat: Quaternion, objRef: THREE.Group) => {
  if (!objRef) return;

  quat.normalize();
  objRef.quaternion.copy(quat);
};

export const getBoundingRadius = (objRef: THREE.Group | undefined) => {
  if (!objRef) return;
  const box = new Box3().setFromObject(objRef);
  const sphere = new Sphere();
  box.getBoundingSphere(sphere);
  return sphere.radius;
};

const makeArrow = (dir: Vector3, length: number, radius: number, color: number) => {
  const origin = dir.clone().normalize().multiplyScalar(radius);
  return new ArrowHelper(dir.clone().normalize(), origin, length, color);
};

const getScaledLength = (value: number, maxAccel: number, maxLength: number) => {
  return (Math.abs(value) / maxAccel) * maxLength;
};

const updateArrow = (arrow: ArrowHelper, vec: Vector3, length: number, radius: number) => {
  const dir = vec.clone().normalize();
  const origin = dir.clone().multiplyScalar(radius);

  arrow.position.copy(origin);
  arrow.setDirection(dir);
  arrow.setLength(length);
};

const updateAccelArrows = (
  accelX: number,
  accelY: number,
  accelZ: number,
  maxAccel: number,
  maxLength: number,
  radius: number,
  accelVectors: {
    x: ArrowHelper;
    y: ArrowHelper;
    z: ArrowHelper;
    net: ArrowHelper;
  }
) => {
  if (!accelVectors) return;

  const xVec = new Vector3(accelX, 0, 0);
  const yVec = new Vector3(0, accelY, 0);
  const zVec = new Vector3(0, 0, accelZ);
  const netVec = new Vector3(accelX, accelY, accelZ);

  const xLength = getScaledLength(accelX, maxAccel, maxLength);
  const yLength = getScaledLength(accelY, maxAccel, maxLength);
  const zLength = getScaledLength(accelZ, maxAccel, maxLength);
  const netLength = getScaledLength(netVec.length(), maxAccel, maxLength);

  updateArrow(accelVectors.x, xVec, xLength, radius);
  updateArrow(accelVectors.y, yVec, yLength, radius);
  updateArrow(accelVectors.z, zVec, zLength, radius);
  updateArrow(accelVectors.net, netVec, netLength, radius);
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
  private firstTimestamp = 0;
  private lastTimestamp = 0;
  private startTime = 0;
  private angleMode: 'quaternion' | 'euler';
  private speed = 1;
  private listeners: ((event: ReplayEvent) => void)[] = [];
  private accelVectors: {x: ArrowHelper; y: ArrowHelper; z: ArrowHelper; net: ArrowHelper;};
  private MAX_ARROW_LENGTH = 100;
  private max_accel: number;
  private boundingRadius: number;

  constructor(
    data: replayData,
    objRef: THREE.Group,
    angleMode: 'quaternion' | 'euler' = 'quaternion',
  ) {
    this.data = data;
    this.objRef = objRef;
    this.angleMode = angleMode;

    // Calculate bounding radius for arrow placement
    this.boundingRadius = getBoundingRadius(objRef) || 1;

    // Compute max acceleration for scaling arrows
    this.max_accel = computeMaxAccel(data);

    // Set up acceleration vectors
    this.accelVectors = {
      x: makeArrow(new Vector3(1, 0, 0), this.MAX_ARROW_LENGTH / 2, this.boundingRadius, 0xff0000),
      y: makeArrow(new Vector3(0, 1, 0), this.MAX_ARROW_LENGTH / 2, this.boundingRadius, 0x00ff00),
      z: makeArrow(new Vector3(0, 0, 1), this.MAX_ARROW_LENGTH / 2, this.boundingRadius, 0x0000ff),
      net: makeArrow((new Vector3(1, 1, 1)), this.MAX_ARROW_LENGTH / 2, this.boundingRadius, 0x000000),
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
      this.firstTimestamp = this.data[0]?.timestamp || 0;
    } else {
      // Adjust the start time for resuming from the current index
      this.startTime = performance.now() - (this.lastTimestamp - this.firstTimestamp) / this.speed;
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
    const elapsed = (now - this.startTime) * this.speed + this.firstTimestamp;

    while (
      this.currentIndex < this.data.length &&
      this.data[this.currentIndex].timestamp <= elapsed
    ) {
      const { x, y, z, w, timestamp, accelX, accelY, accelZ } = this.data[this.currentIndex];
      updateQuaternion(new Quaternion(x, y, z, w), this.objRef);
      updateAccelArrows(
        accelX,
        accelY,
        accelZ,
        this.max_accel,
        this.MAX_ARROW_LENGTH,
        this.boundingRadius,
        this.accelVectors
      );


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

