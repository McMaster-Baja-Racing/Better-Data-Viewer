// probably too verbose to put in the actual code
const analyzerData = [
  {
    title: "No Analyzer.",
    code: null,
    parameters: [],
    checked: true,
    description: "Probably self-explanatory",
    image: {
      link: "",
      alt: "Did you really expect an image?"
    },
    links: [
      {
        title: "",
        link: "",
      },
    ]
  },
  {
    title: "Interpolation",
    code: "linearInterpolate",
    parameters: [], // One day should take in column
    description: "Interpolation is the act of adding new data points between existing data points. This is useful for making data more readable, or for making it easier to compare data sets. This is implemented linearly.",
    image: {
      link: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/LinearInterpolation.svg/450px-LinearInter  polation.svg.png",
      alt: "Linear Interpolate Image"
    },
    links: [
      {
        title: "Linear Interpolation",
        link: "https://en.wikipedia.org/wiki/Linear_interpolation#:~:text=Linear%20interpolation%20on%20a%20set,)%2C%20thus%20of%20differentiability%20class%20.",
      },
    ]
  },
  {
    title: "Acceleration Curve Tool",
    code: "accelCurve",
    parameters: [],
    description: "Given both primary (on y-axis) and secondary (x-axis) RPM values, this tool will first apply a noise reduction algorithm, and then interpolate between them to achieve a graph that displays the shift curve. ",
    image: {
      link: "./accel.png",
      alt: "fuck u"
    },
    links: [
      {
        title: "CVT Shifting Stages",
        link: "CVT_Tutorial-part-2.pdf",
      },
    ]
  },
  {
    title: "Moving Average",
    code: "rollAvg",
    parameters: [{ name: "WindowSize", default: "100" }],
    description: "Given noisy data, this will take the average over a window of points. This should help reduce noise, but can add other imperfections.",
    image: {
      link: "./rollAvg.png",
      alt: "rollAvg Image"
    },
    links: [
      {
        title: "Moving Average",
        link: "https://en.wikipedia.org/wiki/Moving_average",
      },
    ]
  },
  {
    title: "Compression",
    code: "RDPCompression",
    parameters: [{ name: "Epsilon", default: "0.1" }],
    description: "The Ramer-Douglas-Peucker algorithm helps simplify a curve by removing some of its points while keeping its overall shape intact. It's a handy tool for looking at large files!",
    image: {
      link: "rdp.gif",
      alt: "RDP Image"
    },
    links: [
      {
        title: "Ramer–Douglas–Peucker algorithm",
        link: "https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm",
      },
    ]
  },
  {
    title: "Ultimate Smoothener",
    code: "sGolay",
    parameters: [{ name: "Window Size", default: "100" }, { name: "Polynomial Order", default: "3" }],
    description: "Implements the Savitzky-Golay algorithm in order to smooth out a curve. This is a very powerful tool that can help capture many trends not visible. Input variables are the window and polynomial order.",
    image: {
      link: "sgolay.gif",
      alt: "sGolay Image"
    },
    links: [
      {
        title: "Savitzky–Golay filter",
        link: "https://en.wikipedia.org/wiki/Savitzky%E2%80%93Golay_filter",
      },
    ]
  },
  {
    title: "Split",
    code: "split",
    parameters: [{ name: "Start", default: "0" }, { name: "End", default: null }],
    description: "Splits the data into two parts, given a start and end point (timestamp)",
    image: {
      link: "split.png",
      alt: "Split Image"
    },
    links: [
      {
        title: "Y = mx + b",
        link: "https://byjus.com/maths/y-mx-b/#:~:text=y%20%3D%20mx%20%2B%20b%20is%20the,how%20steep%20the%20line%20is.",
      },
    ]
  },
  {
    title: "Linear Multiply.",
    code: "linearMultiply",
    parameters: [{ name: "Multiplier", default: "1" }, { name: "Offset", default: "0" }],
    description: "Given a multiplier and offset, this will multiply the data by the multiplier and add the offset.",
    image: {
      link: "linmult.png",
      alt: "Multiply Image"
    },
    links: [
      {
        title: "Y = mx + b",
        link: "https://byjus.com/maths/y-mx-b/#:~:text=y%20%3D%20mx%20%2B%20b%20is%20the,how%20steep%20the%20line%20is.",
      },
      {
        title: "Slope Intercept Form",
        link: "https://www.cuemath.com/geometry/y-mx-b/",
      }
    ]
  },
];

export default analyzerData;