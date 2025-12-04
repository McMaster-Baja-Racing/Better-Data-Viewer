import {
  replayData,
  ReplayEvent,
  ReplayEventType,
  StateType
} from '@types';
import {
  Quaternion,
  ArrowHelper,
  Vector3,
  Box3,
  Sphere,
  Group,
  Mesh,
} from 'three';
import { ApiUtil } from './apiUtils';

const extractColumnData = (data: string[][], col = 1) =>
  data.map(row => row[col]);

const parseCSV = (data: string) =>
  data
    .trim()
    .split('\n')
    .slice(1)
    .map(row => row.split(','));

const combineData = (
  timestamps: string[],
  x: string[],
  y: string[],
  z: string[],
  w: string[],
  accelX: string[],
  accelY: string[],
  accelZ: string[]
): replayData =>
  timestamps.map((timestamp, i) => ({
    timestamp: Number(timestamp),
    x: Number(x[i]),
    y: Number(y[i]),
    z: Number(z[i]),
    w: Number(w[i]),
    accelX: Number(accelX[i]),
    accelY: Number(accelY[i]),
    accelZ: Number(accelZ[i])
  }));

export const fetchData = async (bin: string) => {
  let data: replayData = [];

  const [
    wRaw,
    xRaw,
    yRaw,
    zRaw,
    axRaw,
    ayRaw,
    azRaw
  ] = await Promise.all([
    ApiUtil.getFileAsText(`${bin}/IMU QUAT W.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU QUAT X.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU QUAT Y.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU QUAT Z.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU ACCEL X.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU ACCEL Y.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU ACCEL Z.csv`)
  ]);

  const wData = parseCSV(wRaw);
  const xData = parseCSV(xRaw);
  const yData = parseCSV(yRaw);
  const zData = parseCSV(zRaw);
  const axData = parseCSV(axRaw);
  const ayData = parseCSV(ayRaw);
  const azData = parseCSV(azRaw);

  const timestamps = extractColumnData(wData, 0);
  const w = extractColumnData(wData);
  const x = extractColumnData(xData);
  const y = extractColumnData(yData);
  const z = extractColumnData(zData);
  const ax = extractColumnData(axData);
  const ay = extractColumnData(ayData);
  const az = extractColumnData(azData);

  data = combineData(timestamps, x, y, z, w, ax, ay, az);
  return data;
};

const computeMaxAccel = (data: replayData): number => {
  let max = 0;
  for (const p of data) {
    max = Math.max(
      max,
      Math.abs(p.accelX),
      Math.abs(p.accelY),
      Math.abs(p.accelZ)
    );
  }
  return max === 0 ? 1 : max;
};

export const getBoundingRadius = (obj: Group | undefined) => {
  const geomBox = new Box3();

  obj?.traverse(child => {
    if (child instanceof Mesh) {
      child.geometry.computeBoundingBox();
      const childBox = child.geometry.boundingBox.clone();
      childBox.applyMatrix4(child.matrixWorld);
      geomBox.union(childBox);
    }
  });

  const sphere = new Sphere();
  geomBox.getBoundingSphere(sphere);
  return sphere.radius;
};

export class ModelReplayController {
  private listeners = new Set<(event: ReplayEvent) => void>();

  private data: replayData;
  private isPlaying = false;
  private speed = 1;

  private currentIndex = 0;
  private lastTimestamp = 0;
  private startTime = 0;

  private rafId: number | null = null;
  private loopBound = (t: number) => this.loop(t);

  constructor(data: replayData) {
    this.data = data;
  }

  on(listener: (event: ReplayEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: ReplayEvent) {
    for (const h of this.listeners) {
      h(event);
    }
  }

  play() {
    if (this.isPlaying) return;

    if (this.currentIndex === 0) {
      this.startTime = performance.now();
    } else if (this.currentIndex >= this.data.length) {
      this.reset();
      this.startTime = performance.now();
    } else {
      this.startTime =
        performance.now() - this.lastTimestamp / this.speed;
    }

    this.isPlaying = true;
    this.emit({
      type: ReplayEventType.StateChanged,
      state: StateType.Playing
    });

    this.rafId = requestAnimationFrame(this.loopBound);
  }

  pause() {
    this.isPlaying = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.emit({
      type: ReplayEventType.StateChanged,
      state: StateType.Paused
    });
  }

  reset() {
    this.currentIndex = 0;
    this.lastTimestamp = 0;
  }

  setSpeed(s: number) {
    if (s <= 0) return;

    if (this.isPlaying) {
      const now = performance.now();
      const elapsedOriginal = (now - this.startTime) * this.speed;
      this.startTime = now - elapsedOriginal / s;
    }
    this.speed = s;
  }

  setCurrentIndex(i: number) {
    if (i < 0 || i >= this.data.length) return;
    this.currentIndex = i;
    this.lastTimestamp = this.data[i].timestamp;

    if (!this.isPlaying) {
      this.emit({
        type: ReplayEventType.Progress,
        currentIndex: i,
        data: this.data[i]
      });
    }
  }

  private stepUntil(elapsedMs: number) {
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
      this.emit({
        type: ReplayEventType.Progress,
        currentIndex: this.currentIndex,
        data: latest
      });
    }

    if (this.currentIndex >= this.data.length) {
      this.pause();
      this.emit({ type: ReplayEventType.Finished });
      return;
    }

    this.rafId = requestAnimationFrame(this.loopBound);
  }

  dispose() {
    this.pause();
    this.listeners.clear();
  }
}

export class ReplayModelSubscriber {
  private obj: Group;

  private accelVectors: {
    x: ArrowHelper;
    y: ArrowHelper;
    z: ArrowHelper;
    net: ArrowHelper;
  };

  private boundingRadius: number;
  private maxAccel: number;
  private MAX_ARROW_LENGTH = 100;

  private unsubscribe: () => void;

  constructor(objRef: Group, controller: ModelReplayController, data: replayData) {
    this.obj = objRef;

    this.boundingRadius = getBoundingRadius(objRef);
    this.maxAccel = computeMaxAccel(data);

    // Create arrows
    this.accelVectors = {
      x: this.buildArrow(new Vector3(1, 0, 0), 0xff0000),
      y: this.buildArrow(new Vector3(0, 1, 0), 0x00ff00),
      z: this.buildArrow(new Vector3(0, 0, 1), 0x0000ff),
      net: this.buildArrow(new Vector3(1, 1, 1), 0x000000)
    };

    // Add to scene
    if (!objRef.parent) {
      throw new Error('Object must have a parent to add arrows');
    }
    const parent = objRef.parent;
    Object.values(this.accelVectors).forEach(a => parent.add(a));

    // Subscribe immediately
    this.unsubscribe = controller.on(this.handleEvent);
  }

  private handleEvent = (event: ReplayEvent) => {
    if (event.type !== ReplayEventType.Progress) return;


    const p = event.data;

    // quaternion
    const q = new Quaternion(p.x, p.y, p.z, p.w).normalize();
    this.obj.quaternion.copy(q);

    // accel arrows
    this.updateAccel(p.accelX, p.accelY, p.accelZ);
  };

  private buildArrow(dir: Vector3, color: number) {
    const origin = dir.clone().normalize().multiplyScalar(this.boundingRadius);
    return new ArrowHelper(dir.clone().normalize(), origin, 50, color);
  }

  private updateArrow(arrow: ArrowHelper, vec: Vector3, length: number) {
    const dir = vec.lengthSq() === 0 ? new Vector3(1, 0, 0) : vec.clone().normalize();
    const origin = dir.clone().multiplyScalar(this.boundingRadius);

    arrow.setDirection(dir);
    arrow.position.copy(origin);
    arrow.setLength(length);
  }

  private updateAccel(ax: number, ay: number, az: number) {
    const xVec = new Vector3(ax, 0, 0);
    const yVec = new Vector3(0, ay, 0);
    const zVec = new Vector3(0, 0, az);
    const netVec = new Vector3(ax, ay, az);

    const scale = (v: number) =>
      this.maxAccel === 0
        ? 0
        : (Math.abs(v) / this.maxAccel) * this.MAX_ARROW_LENGTH;

    this.updateArrow(this.accelVectors.x, xVec, scale(ax));
    this.updateArrow(this.accelVectors.y, yVec, scale(ay));
    this.updateArrow(this.accelVectors.z, zVec, scale(az));
    this.updateArrow(this.accelVectors.net, netVec, scale(netVec.length()));
  }

  dispose() {
    Object.values(this.accelVectors).forEach(a => {
      a.parent?.remove(a);
    });
    this.unsubscribe();
  }
}

export class ReplayAccelSubscriber {
  private unsubscribe: () => void;

  constructor(controller: ModelReplayController, onUpdate: (vals: {
    ax: number;
    ay: number;
    az: number;
    net: number;
  }) => void) {

    this.unsubscribe = controller.on(event => {
      if (event.type !== ReplayEventType.Progress) return;

      const p = event.data;
      const net = Math.sqrt(p.accelX**2 + p.accelY**2 + p.accelZ**2);

      onUpdate({
        ax: p.accelX,
        ay: p.accelY,
        az: p.accelZ,
        net
      });
    });
  }

  dispose() {
    this.unsubscribe();
  }
}

