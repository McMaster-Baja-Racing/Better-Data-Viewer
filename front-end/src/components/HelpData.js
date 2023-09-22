// probably too verbose to put in the actual code
const helpData = {
    null: {
      title: "No Analyzer.",
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
    linearInterpolate: {
      title: "Interpolation",
      description: "Interpolation is the act of adding new data points between existing data points. This is useful for making data more readable, or for making it easier to compare data sets. This is implemented linearly.",
      image: {
        link: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/LinearInterpolation.svg/450px-LinearInterpolation.svg.png",
        alt: "Linear Interpolate Image"
      },
      links: [
        {
          title: "Linear Interpolation",
          link: "https://en.wikipedia.org/wiki/Linear_interpolation#:~:text=Linear%20interpolation%20on%20a%20set,)%2C%20thus%20of%20differentiability%20class%20.",
        },
      ]
    },
    accelCurve: {
      title: "Acceleration Curve Tool",
      description: "Given both primary and secondary rpm values, this tool will first apply a noise reduction algorithm, and then interpolate between them to achieve a graph that displays the shift curve. ",
      image: {
        link: "GET ANB IMAGE FROM DRIVETRAIN",
        alt: "fuck u"
      },
      links: [
        {
          title: "GET THE HANDY DANDY BOOLKET FROM DRIVETRAIN",
          link: "virus.com",
        },
      ]
    },
    rollAvg: {
        title: "Moving Average",
        description: "Given noisy data, this will take the average over a window of points. This should help reduce noise, but can add other imperfections.",
        image: {
          link: "/linint_95x74.png",
          alt: "Linear Interpolate Image"
        },
        links: [
          {
            title: "Y = mx + b",
            link: "https://byjus.com/maths/y-mx-b/#:~:text=y%20%3D%20mx%20%2B%20b%20is%20the,how%20steep%20the%20line%20is.",
          },
        ]
      },
    RDPCompression: {
      title: "Compression",
      description: "Implements the Ramer-Douglas-Peucker algorithm in order to reduce the number of points in a curve while preserving its shape.",
      image: {
        link: "/linint_95x74.png",
        alt: "Linear Interpolate Image"
      },
      links: [
        {
          title: "Y = mx + b",
          link: "https://byjus.com/maths/y-mx-b/#:~:text=y%20%3D%20mx%20%2B%20b%20is%20the,how%20steep%20the%20line%20is.",
        },
      ]
    },
    sGolay: {
      title: "Ultimate Smoothener",
      description: "Implements the Savitzky-Golay algorithm in order to smooth out a curve. This is a very powerful tool that can help capture many trends not visible. Input variables are the window and polynomial order.",
      image: {
        link: "/linint_95x74.png",
        alt: "Linear Interpolate Image"
      },
      links: [
        {
          title: "Y = mx + b",
          link: "https://byjus.com/maths/y-mx-b/#:~:text=y%20%3D%20mx%20%2B%20b%20is%20the,how%20steep%20the%20line%20is.",
        },
      ]
    },
    split: {
      title: "Split",
      description: "Splits the data into two parts, given a start and end point (timestamp)",
      image: {
        link: "/linint_95x74.png",
        alt: "Linear Interpolate Image"
      },
      links: [
        {
          title: "Y = mx + b",
          link: "https://byjus.com/maths/y-mx-b/#:~:text=y%20%3D%20mx%20%2B%20b%20is%20the,how%20steep%20the%20line%20is.",
        },
      ]
    },
    linearMultiply: {
      title: "Linear Multiply.",
      description: "Given a multiplier and offset, this will multiply the data by the multiplier and add the offset.",
      image: {
        link: "/linint_95x74.png",
        alt: "Linear Interpolate Image"
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
  };
  
  export default helpData;