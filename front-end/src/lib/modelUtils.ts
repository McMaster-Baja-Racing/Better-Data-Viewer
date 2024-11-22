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

export const replayData = (data: quatReplayData, objRef: THREE.Group) => {
  for (const { timestamp, x, y, z, w } of data) {
    setTimeout(() => {
      console.log('Replaying timestamp: ', timestamp);
      updateQuaternion(new Quaternion(x, y, z, w), objRef);
    }, timestamp);
  }
};

export const replayDataEuler = (data: {timestamp: number, x: number, y: number, z: number}[], objRef: THREE.Group) => {
  for (const { timestamp, x, y, z } of data) {
    setTimeout(() => {
      console.log('Replaying timestamp: ', timestamp);
      updateEuler(new Euler(x, y, z), objRef);
    }, timestamp);
  }
};

