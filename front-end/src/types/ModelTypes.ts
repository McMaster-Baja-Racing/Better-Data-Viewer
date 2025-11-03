export interface dataPoint {
  timestamp: number;
  x: number;
  y: number;
  z: number;
  w: number;
  accelX: number;
  accelY: number;
  accelZ: number;
}

export type replayData = dataPoint[];

export enum ReplayEventType {
  StateChanged = 'stateChanged',
  Progress = 'progress',
  Finished = 'finished',
}

export enum StateType {
  Playing = 'playing',
  Paused = 'paused',
  Stopped = 'stopped',
}

export type ReplayEvent =
  | { type: ReplayEventType.StateChanged; state: StateType }
  | { type: ReplayEventType.Progress; currentIndex: number; timestamp: number }
  | { type: ReplayEventType.Finished };