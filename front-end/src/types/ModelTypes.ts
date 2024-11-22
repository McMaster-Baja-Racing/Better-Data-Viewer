export interface quatDataPoint {
  timestamp: number;
  x: number;
  y: number;
  z: number;
  w: number;
}

export type quatReplayData = quatDataPoint[];