/* eslint-disable max-len */
// const images = {};
// const importAll = r => {
//   r.keys().forEach(key => images[key] = r(key));
// };

// importAll(require.context('../assets/help', false, /\.(png|jpe?g|svg|gif)$/));

import { AnalyzerType } from '@types';
import { images } from '../lib/assets.js';

interface analyzerData {
  title: string;
  code: AnalyzerType | null;
  parameters: { name: string; default: string }[];
  checked?: boolean;
  description: string;
  image: {
    link: string;
    alt: string;
    src?: string;
  };
  links: { title: string; link: string }[];
}

// probably too verbose to put in the actual code
const analyzerData: analyzerData[] = [
  {
    title: 'No Analyzer.',
    code: null,
    parameters: [],
    checked: true,
    description: 'Probably self-explanatory',
    image: {
      link: '',
      alt: 'Did you really expect an image?'
    },
    links: [
      {
        title: '',
        link: '',
      },
    ]
  },
  {
    title: 'Acceleration Curve Tool',
    code: AnalyzerType.ACCEL_CURVE,
    parameters: [],
    description: 'Given both primary (on y-axis) and secondary (x-axis) RPM values, this tool will first apply a noise reduction algorithm, and then interpolate between them to achieve a graph that displays the shift curve. ',
    image: {
      link: './accel.png',
      alt: 'fuck u',
      src:  images['accel'],
    },
    links: [
      {
        title: 'CVT Shifting Stages',
        link: 'CVT_Tutorial-part-2.pdf',
      },
    ]
  },
  {
    title: 'Ultimate Smoothener',
    code: AnalyzerType.ROLL_AVG,
    parameters: [{ name: 'Window Size', default: '100' }, { name: 'Polynomial Order', default: '3' }],
    description: 'Implements the Savitzky-Golay algorithm in order to smooth out a curve. This is a very powerful tool that can help capture many trends not visible. Input variables are the window and polynomial order.',
    image: {
      link: 'sgolay.gif',
      alt: 'sGolay Image',
      src: images['sGolay']
    },
    links: [
      {
        title: 'Savitzky–Golay filter',
        link: 'https://en.wikipedia.org/wiki/Savitzky%E2%80%93Golay_filter',
      },
    ]
  },
  {
    title: 'Interpolation',
    code: AnalyzerType.INTERPOLATER_PRO,
    parameters: [], // One day should take in column
    description: 'Interpolation is the act of adding new data points between existing data points. This is useful for making data more readable, or for making it easier to compare data sets. This is implemented linearly.',
    image: {
      link: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/LinearInterpolation.svg/450px-LinearInter  polation.svg.png',
      alt: 'Linear Interpolate Image',
      src: images['interpolate'],
    },
    links: [
      {
        title: 'Linear Interpolation',
        link: 'https://en.wikipedia.org/wiki/Linear_interpolation#:~:text=Linear%20interpolation%20on%20a%20set,)%2C%20thus%20of%20differentiability%20class%20.',
      },
    ]
  },
  {
    title: 'Moving Average',
    code: AnalyzerType.ROLL_AVG,
    parameters: [{ name: 'WindowSize', default: '100' }],
    description: 'Given noisy data, this will take the average over a window of points. This should help reduce noise, but can add other imperfections.',
    image: {
      link: './rollAvg.png',
      alt: 'rollAvg Image',
      src: images['rollingAverage'],
    },
    links: [
      {
        title: 'Moving Average',
        link: 'https://en.wikipedia.org/wiki/Moving_average',
      },
    ]
  },
  {
    title: 'Compression',
    code: AnalyzerType.RDP_COMPRESSION,
    parameters: [{ name: 'Epsilon', default: '0.1' }],
    description: 'The Ramer-Douglas-Peucker algorithm helps simplify a curve by removing some of its points while keeping its overall shape intact. It\'s a handy tool for looking at large files!',
    image: {
      link: 'rdp.gif',
      alt: 'RDP Image',
      src: images['rdpGif'],
    },
    links: [
      {
        title: 'Ramer–Douglas–Peucker algorithm',
        link: 'https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm',
      },
    ]
  },
  {
    title: 'Split',
    code: AnalyzerType.SPLIT,
    parameters: [{ name: 'Start', default: '0' }, { name: 'End', default: '' }],
    description: 'Splits the data into two parts, given a start and end point (timestamp)',
    image: {
      link: 'split.png',
      alt: 'Split Image',
      src: images['split'],
    },
    links: [
      {
        title: 'Y = mx + b',
        link: 'https://byjus.com/maths/y-mx-b/#:~:text=y%20%3D%20mx%20%2B%20b%20is%20the,how%20steep%20the%20line%20is.',
      },
    ]
  },
  {
    title: 'Linear Multiply.',
    code: AnalyzerType.LINEAR_MULTIPLY,
    parameters: [{ name: 'Multiplier', default: '1' }, { name: 'Offset', default: '0' }],
    description: 'Given a multiplier and offset, this will multiply the data by the multiplier and add the offset.',
    image: {
      link: 'linmult.png',
      alt: 'Multiply Image',
      src: images['linearMultiplier'],
    },
    links: [
      {
        title: 'Y = mx + b',
        link: 'https://byjus.com/maths/y-mx-b/#:~:text=y%20%3D%20mx%20%2B%20b%20is%20the,how%20steep%20the%20line%20is.',
      },
      {
        title: 'Slope Intercept Form',
        link: 'https://www.cuemath.com/geometry/y-mx-b/',
      }
    ]
  },
  {
    title: 'Cubic Multiply.',
    code: AnalyzerType.CUBIC,
    parameters: [{ name: 'A', default: '1' }, { name: 'B', default: '1' }, { name: 'C', default: '1' }, { name: 'D', default: '1' }],
    description: 'Given the coefficients of a cubic function, this will pass the data into the cubic function.',
    image: {
      link: 'cubic.png',
      alt: 'Cubic Image'
    },
    links: [
      {
        title: 'Cubic Function',
        link: 'https://en.wikipedia.org/wiki/Cubic_function',
      },
    ]
  },
  {
    title: 'Delete Outliers',
    code: AnalyzerType.DELETE_OUTLIER,
    parameters: [{ name: 'Threshold', default: '1' }],
    description: 'Given a threshold, this will remove any points that are outside of the threshold.',
    image: {
      link: 'deleteOutliers.png',
      alt: 'Delete Outliers Image',
      src: images['deleteOutliers'],
    },
    links: [
      {
        title: 'Outlier',
        link: 'https://en.wikipedia.org/wiki/Outlier',
      },
    ]
  },
  {
    title: 'Strict Timestamps',
    code: AnalyzerType.STRICT_TIMESTAMP,
    parameters: [],
    description: 'This will take the timestamps and make them strictly increasing. This is useful for some analyzers that require strictly increasing timestamps.',
    image: {
      link: 'strict.png',
      alt: 'Strict Timestamps Image',
      src: images['strict'],
    },
    links: [
      {
        title: 'Strictly Increasing',
        link: 'https://en.wikipedia.org/wiki/Strictly_increasing',
      },
    ]
  }
];

export default analyzerData;