import { quatReplayData, ReplayEvent, ReplayEventType, StateType } from '@types';
import { ApiUtil } from './apiUtils';
import { Quaternion } from 'three';

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

const combineData = (timestamps: string[], x: string[], y: string[], z: string[], w: string[]) => {
  return timestamps.map((timestamp, i) => ({
    timestamp: Number(timestamp),
    x: Number(x[i]),
    y: Number(y[i]),
    z: Number(z[i]),
    w: Number(w[i])
  }));
};

// TODO: Handle errors better
export const fetchData = async (bin: string) => {
  let data: quatReplayData = [];
  await Promise.all([
    ApiUtil.getFileAsText(`${bin}/IMU QUAT W.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU QUAT X.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU QUAT Y.csv`),
    ApiUtil.getFileAsText(`${bin}/IMU QUAT Z.csv`)
  ]).then(([wDataRaw, xDataRaw, yDataRaw, zDataRaw]) => {
    const wData = parseCSV(wDataRaw);
    const xData = parseCSV(xDataRaw);
    const yData = parseCSV(yDataRaw);
    const zData = parseCSV(zDataRaw);

    const w = extractColumnData(wData);
    const x = extractColumnData(xData);
    const y = extractColumnData(yData);
    const z = extractColumnData(zData);
    const timestamps = extractColumnData(wData, 0);

    data = combineData(timestamps, x, y, z, w);
  });
  return data;
};

export class ModelReplayController {
  private data: quatReplayData;
  private objRef: THREE.Group;
  private isPlaying = false;
  private currentIndex = 0;
  private lastTimestamp = 0;
  private startTime = 0;
  private speed = 1;
  private listeners: ((event: ReplayEvent) => void)[] = [];

  private rafId: number | null = null;
  private loopBound = (now: number) => this.loop(now);

  constructor(data: quatReplayData, objRef: THREE.Group) {
    this.data = data;
    this.objRef = objRef;
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

  private stepUntil(elapsedMs: number): quatReplayData[number] | null {
    let latest: quatReplayData[number] | null = null;
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

  private updateModel(point: quatReplayData[number]) {
    if (this.objRef) {
      const q = new Quaternion(point.x, point.y, point.z, point.w);
      this.objRef.quaternion.copy(q);
    }
  }

  dispose() {
    this.pause();
    this.listeners = [];
  }
}

