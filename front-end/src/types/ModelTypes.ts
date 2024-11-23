export interface quatDataPoint {
  timestamp: number;
  x: number;
  y: number;
  z: number;
  w: number;
}

export type quatReplayData = quatDataPoint[];

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