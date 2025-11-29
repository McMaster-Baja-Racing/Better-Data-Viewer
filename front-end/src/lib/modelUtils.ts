import { replayData, ReplayEvent, ReplayEventType, StateType } from '@types';
import { ApiUtil } from './apiUtils';
import { Quaternion, ArrowHelper, Vector3, Box3, Sphere } from 'three';

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

const computeMaxAccel = (data: replayData) => {
  let maxVal = -Infinity;

  for (const { accelX, accelY, accelZ } of data) {
    maxVal = Math.max(maxVal, Math.abs(accelX), Math.abs(accelY), Math.abs(accelZ));
  }

  // Avoid zero range
  if (maxVal === 0) maxVal = 1;

  return maxVal;
};

export const getBoundingRadius = (objRef: THREE.Group | undefined) => {
  if (!objRef) return;
  const box = new Box3().setFromObject(objRef);
  const sphere = new Sphere();
  box.getBoundingSphere(sphere);
  return sphere.radius;
};

export class ModelReplayController {
  private data: replayData;
  private objRef: THREE.Group;
  private isPlaying = false;
  private currentIndex = 0;
  private lastTimestamp = 0;
  private startTime = 0;
  private speed = 1;
  private listeners: ((event: ReplayEvent) => void)[] = [];
  private accelVectors: {x: ArrowHelper; y: ArrowHelper; z: ArrowHelper; net: ArrowHelper;} | null = null;
  private MAX_ARROW_LENGTH = 100;
  private max_accel: number;
  private boundingRadius: number;
  private scene: THREE.Object3D | null;

  private rafId: number | null = null;
  private loopBound = (now: number) => this.loop(now);

  constructor(data: replayData, objRef: THREE.Group) {
    this.data = data;
    this.objRef = objRef;

    // Calculate bounding radius for arrow placement
    this.boundingRadius = getBoundingRadius(objRef) || 1;

    // Compute max acceleration for scaling arrows
    this.max_accel = computeMaxAccel(data);

    // Set up acceleration vectors
    this.accelVectors = {
      x: this.makeArrow(new Vector3(1, 0, 0), 0xff0000),
      y: this.makeArrow(new Vector3(0, 1, 0), 0x00ff00),
      z: this.makeArrow(new Vector3(0, 0, 1), 0x0000ff),
      net: this.makeArrow(new Vector3(1, 1, 1), 0x000000),
    };
    
    this.scene = objRef.parent;
    Object.values(this.accelVectors).forEach(vec => this.scene?.add(vec));
  }

  on(eventHandler: (event: ReplayEvent) => void) {
    this.listeners.push(eventHandler);
    return () => this.off(eventHandler);
  }

  off(eventHandler: (event: ReplayEvent) => void) {
    this.listeners = this.listeners.filter(h => h !== eventHandler);
  }

  private emit(event: ReplayEvent) {
    this.listeners.forEach(handler => handler(event));
  }

  play() {
    if (this.isPlaying) return;

    if (this.currentIndex === 0) {
      this.startTime = performance.now();
    } else if (this.currentIndex >= this.data.length) {
      this.reset();
      this.startTime = performance.now();
    } else {
      this.startTime = performance.now() - (this.lastTimestamp / this.speed);
    }

    this.isPlaying = true;
    this.emit({ type: ReplayEventType.StateChanged, state: StateType.Playing });

    if (this.rafId != null) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(this.loopBound);
  }

  pause() {
    this.isPlaying = false;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.emit({ type: ReplayEventType.StateChanged, state: StateType.Paused });
  }

  reset() {
    this.currentIndex = 0;
    this.lastTimestamp = 0;
  }

  setSpeed(newSpeed: number) {
    if (newSpeed <= 0) return;
    if (this.isPlaying) {
      const now = performance.now();
      const elapsed = ((now - this.startTime) * this.speed);
      this.startTime = now - (elapsed / newSpeed);
    }
    this.speed = newSpeed;
  }

  setCurrentIndex(index: number) {
    if (index < 0 || index >= this.data.length) return;
    this.currentIndex = index;
    this.lastTimestamp = this.data[index]?.timestamp || 0;

    if (!this.isPlaying) {
      this.emit({
        type: ReplayEventType.Progress,
        currentIndex: index,
        data: this.data[index],
      });
      this.updateModel(this.data[index]);
    }
  }

  private stepUntil(elapsedMs: number): replayData[number] | null {
    let latest: replayData[number] | null = null;
    while (
      this.currentIndex < this.data.length &&
      this.data[this.currentIndex].timestamp <= elapsedMs
    ) {
      latest = this.data[this.currentIndex];
      this.lastTimestamp = latest.timestamp;
      this.currentIndex++;
    }
    return latest;
  }

  private loop(now: number) {
    if (!this.isPlaying) return;
    const elapsedMs = (now - this.startTime) * this.speed;
    const latest = this.stepUntil(elapsedMs);

    if (latest) {
      this.updateModel(latest);
      this.emit({
        type: ReplayEventType.Progress,
        currentIndex: this.currentIndex,
        data: latest,
      });
    }

    if (this.currentIndex >= this.data.length) {
      this.pause();
      this.emit({ type: ReplayEventType.Finished });
      return;
    }

    this.rafId = requestAnimationFrame(this.loopBound);
  }

  private makeArrow = (dir: Vector3, color: number) => {
    const origin = dir.clone().normalize().multiplyScalar(this.boundingRadius);
    return new ArrowHelper(dir.clone().normalize(), origin, this.MAX_ARROW_LENGTH / 2, color);
  };

  private updateModel(point: replayData[number]) {
    this.updateQuaternion(point.x, point.y, point.z, point.w);
    this.updateAccelArrows(point.accelX, point.accelY, point.accelZ);
  }

  private updateQuaternion = (x: number, y: number, z: number, w: number) => {
    if (this.objRef) {
      const quat = new Quaternion(x, y, z, w);
      quat.normalize();
      this.objRef.quaternion.copy(quat);
    }
  };

  private updateArrow = (arrow: ArrowHelper, vec: Vector3, length: number) => {
    const dir = vec.clone().normalize();
    const origin = dir.clone().multiplyScalar(this.boundingRadius);
    arrow.setDirection(dir);
    arrow.position.copy(origin);
    arrow.setLength(length);
  };

  private updateAccelArrows = (accelX: number, accelY: number, accelZ: number) => {
    if (!this.accelVectors) return;

    const xVec = new Vector3(accelX, 0, 0);
    const yVec = new Vector3(0, accelY, 0);
    const zVec = new Vector3(0, 0, accelZ);
    const netVec = new Vector3(accelX, accelY, accelZ);

    const xLength = this.getScaledLength(accelX);
    const yLength = this.getScaledLength(accelY);
    const zLength = this.getScaledLength(accelZ);
    const netLength = this.getScaledLength(netVec.length());

    this.updateArrow(this.accelVectors.x, xVec, xLength);
    this.updateArrow(this.accelVectors.y, yVec, yLength);
    this.updateArrow(this.accelVectors.z, zVec, zLength);
    this.updateArrow(this.accelVectors.net, netVec, netLength);
  };

  private getScaledLength = (value: number) => {
    return (Math.abs(value) / this.max_accel) * this.MAX_ARROW_LENGTH;
  };

  dispose() {
    this.pause();
    this.listeners = [];

    // Remove acceleration arrows from the scene
    if (this.accelVectors) {
      Object.values(this.accelVectors).forEach(arrow => {
        if (arrow && arrow.parent) {
          arrow.parent.remove(arrow);
        }
      });
      this.accelVectors = null;
    }
  }
}

