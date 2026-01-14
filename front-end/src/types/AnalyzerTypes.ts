/* eslint-disable max-len */
import { AnalyzerType } from '@types';
import {
  accelImage,
  interpolateImage,
  linearMultiplierImage,
  RdpGif,
  rollAvgImage,
  savitzkyGolayGif,
  splitImage,
  placeholderImage // TODO: Get rid of this and all places its used
} from '@assets/help';

export interface ParameterConfig {
    name: string;
    defaultValue: string;
}

export interface LinkConfig {
    title: string;
    url: string;
}

export interface ImageConfig {
    src: string;    // local import or URL
    alt: string;
}

export interface AnalyzerConfigItem {
    title: string;
    description: string;
    isJoinBased: boolean;
    parameters?: ParameterConfig[];
    image?: ImageConfig;
    links?: LinkConfig[];
    defaultChecked?: boolean;
}

export type AnalyzerKey = AnalyzerType | 'NONE';


export const analyzerConfig: Record<AnalyzerKey, AnalyzerConfigItem> = {
  NONE: {
    title: 'No Analyzer',
    description: 'Probably self-explanatory',
    isJoinBased: false,
    defaultChecked: true,
  },
  
  [AnalyzerType.ACCEL_CURVE]: {
    title: 'Acceleration Curve Tool',
    description:
        'Given both primary (y-axis) and secondary (x-axis) RPM values, applies noise reduction then interpolates to show the shift curve.',
    isJoinBased: true,
    image: {
      src: accelImage,
      alt: 'Acceleration curve demo',
    },
    links: [{ title: 'CVT Shifting Stages', url: 'CVT_Tutorial-part-2.pdf' }],
  },
  
  [AnalyzerType.SGOLAY]: {
    title: 'Savitzky-Golay Smoother',
    description:
        'Smooths a curve by fitting consecutive sub-sets of data points with a low-degree polynomial.',
    isJoinBased: false,
    parameters: [
      { name: 'Window Size', defaultValue: '100' },
      { name: 'Polynomial Order', defaultValue: '3' },
    ],
    image: {
      src: savitzkyGolayGif,
      alt: 'Savitzky-Golay filter demo',
    },
    links: [{ title: 'Savitzky–Golay filter (Wiki)', url: 'https://en.wikipedia.org/wiki/Savitzky%E2%80%93Golay_filter' }],
  },

  [AnalyzerType.LINEAR_MULTIPLY]: {
    title: 'Linear Multiplier',
    description:
        'Multiplies the data by a linear factor.',
    isJoinBased: false,
    parameters: [
      { name: 'Multiplier', defaultValue: '1' }, 
      { name: 'Offset', defaultValue: '0' },
    ],
    image: {
      src: linearMultiplierImage,
      alt: 'Linear multiplication demo',
    },
    links: [{ title: 'Linear Multiplication (Wiki)', url: 'https://en.wikipedia.org/wiki/Linear_multiplication' }],
  },

  [AnalyzerType.RDP_COMPRESSION]: {
    title: 'Ramer-Douglas-Peucker Compression',
    description:
        'Reduces the number of points in a curve while maintaining its shape.',
    isJoinBased: false,
    parameters: [
      { name: 'Epsilon', defaultValue: '0.1' }
    ],
    image: {
      src: RdpGif,
      alt: 'RDP compression demo',
    },
    links: [{ title: 'Ramer-Douglas-Peucker algorithm (Wiki)', url: 'https://en.wikipedia.org/wiki/Ramer-Douglas-Peucker_algorithm' }],
  },

  [AnalyzerType.ROLL_AVG]: {
    title: 'Rolling Average',
    description:
        'Calculates the average of a set of data points over a specified window.',
    isJoinBased: false,
    parameters: [
      { name: 'WindowSize', defaultValue: '100' }
    ],
    image: {
      src: rollAvgImage,
      alt: 'Rolling average demo',
    },
    links: [{ title: 'Moving Average (Wiki)', url: 'https://en.wikipedia.org/wiki/Moving_average' }],
  },

  [AnalyzerType.DELETE_OUTLIER]: {
    title: 'Delete Outlier',
    description:
        'Given a minimum and maximum, this will remove any points that are outside of the range.',
    isJoinBased: false,
    parameters: [
      {name : 'Min X', defaultValue: '-1000000000'}, 
      {name : 'Max X', defaultValue: '1000000000'}, 
      { name: 'Min Y', defaultValue: '-1000000000'}, 
      {name: 'Max Y', defaultValue: '1000000000' }
    ],
    image: {
      src: placeholderImage,
      alt: 'Delete outlier demo',
    },
    links: [{ title: 'Outlier Detection (Wiki)', url: 'https://en.wikipedia.org/wiki/Outlier' }],
  },

  [AnalyzerType.STRICT_TIMESTAMP]: {
    title: 'Strict Timestamp',
    description:
        'Ensures that the timestamps in the data set are strictly increasing.',
    isJoinBased: false,
    image: {
      src: placeholderImage,
      alt: 'Strict timestamp demo',
    },
    links: [{ title: 'Timestamp (Wiki)', url: 'https://en.wikipedia.org/wiki/Timestamp' }],
  },

  [AnalyzerType.SPLIT]: {
    title: 'Split',
    description:
        'Splits the data set into two parts based on a specified timestamp.',
    isJoinBased: false,
    parameters: [
      { name: 'Start', defaultValue: '0' },
      { name: 'End', defaultValue: '' },
    ],
    image: {
      src: splitImage,
      alt: 'Split demo',
    },
    links: [{ title: 'Split (Wiki)', url: 'https://en.wikipedia.org/wiki/Split' }],
  },

  [AnalyzerType.AVERAGE]: {
    title: 'Average',
    description:
        'Calculates the average of the data points.',
    isJoinBased: false,
    image: {
      src: placeholderImage,
      alt: 'Average demo',
    },
    links: [{ title: 'Average (Wiki)', url: 'https://en.wikipedia.org/wiki/Average' }],
  },

  [AnalyzerType.CUBIC]: {
    title: 'Cubic',
    description:
          'Applies a cubic function to the data points.',
    isJoinBased: false,
    parameters: [
      { name: 'A', defaultValue: '1' }, 
      { name: 'B', defaultValue: '1' }, 
      { name: 'C', defaultValue: '1' }, 
      { name: 'D', defaultValue: '1' }],
    image: {
      src: placeholderImage,
      alt: 'Cubic demo',
    },
    links: [{ title: 'Cubic Function (Wiki)', url: 'https://en.wikipedia.org/wiki/Cubic_function' }],
  },

  [AnalyzerType.SMOOTH_STRICT_PRIM]: {
    title: 'Smooth Strict PRIM',
    description:
        'Runs StrictTimstamp and Sgolay for RPM PRIM',
    isJoinBased: false,
    image: {
      src: placeholderImage,
      alt: 'Strict timestamp demo',
    },
    links: [{ title: 'Timestamp (Wiki)', url: 'https://en.wikipedia.org/wiki/Timestamp' }],
  },

  [AnalyzerType.SMOOTH_STRICT_SEC]: {
    title: 'Smooth Strict SEC',
    description:
        'Runs StrictTimstamp and Sgolay for RPM SEC',
    isJoinBased: false,
    image: {
      src: placeholderImage,
      alt: 'Strict timestamp demo',
    },
    links: [{ title: 'Timestamp (Wiki)', url: 'https://en.wikipedia.org/wiki/Timestamp' }],
  },
};