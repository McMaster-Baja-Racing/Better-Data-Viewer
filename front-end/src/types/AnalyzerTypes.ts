import { AnalyzerType } from "@types";
import { images } from '../lib/assets.js';

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
        src: images.accel,
        alt: 'Acceleration curve demo',
      },
      links: [{ title: 'CVT Shifting Stages', url: 'CVT_Tutorial-part-2.pdf' }],
    },
  
    [AnalyzerType.SHIFT_CURVE]: {
      title: 'Shift Curve',
      description:
        'Aligns primary and secondary RPM into the same range for easy comparison.',
      isJoinBased: true,
      image: {
        src: images.shiftCurve,
        alt: 'Shift curve graphic',
      },
      links: [{ title: 'Shift Curve (Wiki)', url: 'https://en.wikipedia.org/wiki/Shift_curve' }],
    },
  
    [AnalyzerType.SGOLAY]: {
      title: 'Savitzky-Golay Smoother',
      description:
        'Smooths a curve by fitting consecutive sub-sets of data points with a low-degree polynomial.',
      isJoinBased: false,
      parameters: [
        { name: 'windowSize', defaultValue: '100' },
        { name: 'polyOrder', defaultValue: '3' },
      ],
      image: {
        src: images.sGolay,
        alt: 'Savitzky-Golay filter demo',
      },
      links: [{ title: 'Savitzky–Golay filter (Wiki)', url: 'https://en.wikipedia.org/wiki/Savitzky%E2%80%93Golay_filter' }],
    },

    [AnalyzerType.LINEAR_INTERPOLATE]: {
      title: 'Linear Interpolator',
      description:
        'Applies linear interpolation to fill in gaps in data.',
      isJoinBased: true,
      image: {
        src: images.linearInterpolate,
        alt: 'Linear interpolation demo',
      },
      links: [{ title: 'Linear Interpolation (Wiki)', url: 'https://en.wikipedia.org/wiki/Linear_interpolation' }],
    },

    [AnalyzerType.LINEAR_MULTIPLY]: {
      title: 'Linear Multiplier',
      description:
        'Multiplies the data by a linear factor.',
      isJoinBased: false,
      image: {
        src: images.linearMultiply,
        alt: 'Linear multiplication demo',
      },
      links: [{ title: 'Linear Multiplication (Wiki)', url: 'https://en.wikipedia.org/wiki/Linear_multiplication' }],
    },

    [AnalyzerType.RDP_COMPRESSION]: {
      title: 'Ramer-Douglas-Peucker Compression',
      description:
        'Reduces the number of points in a curve while maintaining its shape.',
      isJoinBased: false,
      image: {
        src: images.rdpCompression,
        alt: 'RDP compression demo',
      },
      links: [{ title: 'Ramer-Douglas-Peucker algorithm (Wiki)', url: 'https://en.wikipedia.org/wiki/Ramer–Douglas–Peucker_algorithm' }],
    },

    [AnalyzerType.ROLL_AVG]: {
      title: 'Rolling Average',
      description:
        'Calculates the average of a set of data points over a specified window.',
      isJoinBased: false,
      image: {
        src: images.rollAvg,
        alt: 'Rolling average demo',
      },
      links: [{ title: 'Moving Average (Wiki)', url: 'https://en.wikipedia.org/wiki/Moving_average' }],
    },

    [AnalyzerType.DELETE_OUTLIER]: {
      title: 'Delete Outlier',
      description:
        'Removes outliers from the data set.',
      isJoinBased: false,
      image: {
        src: images.deleteOutlier,
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
        src: images.strictTimestamp,
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
        { name: 'start', defaultValue: '0' },
        { name: 'end', defaultValue: '' },
      ],
      image: {
        src: images.split,
        alt: 'Split demo',
      },
      links: [{ title: 'Split (Wiki)', url: 'https://en.wikipedia.org/wiki/Split' }],
    },

    [AnalyzerType.INTERPOLATER_PRO]: {
      title: 'Interpolation Pro',
      description:
        'Advanced interpolation tool for more complex data sets.',
      isJoinBased: true,
      image: {
        src: images.interpolaterPro,
        alt: 'Interpolation Pro demo',
      },
      links: [{ title: 'Interpolation (Wiki)', url: 'https://en.wikipedia.org/wiki/Interpolation' }],
    },

    [AnalyzerType.AVERAGE]: {
      title: 'Average',
      description:
        'Calculates the average of the data points.',
      isJoinBased: false,
      image: {
        src: images.average,
        alt: 'Average demo',
      },
      links: [{ title: 'Average (Wiki)', url: 'https://en.wikipedia.org/wiki/Average' }],
    },

    [AnalyzerType.CUBIC]: {
        title: 'Cubic',
        description:
          'Applies a cubic function to the data points.',
        isJoinBased: false,
        image: {
            src: images.cubic,
            alt: 'Cubic demo',
        },
        links: [{ title: 'Cubic Function (Wiki)', url: 'https://en.wikipedia.org/wiki/Cubic_function' }],
        },
};  