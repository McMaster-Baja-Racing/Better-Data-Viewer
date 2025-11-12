import { useState, useEffect } from 'react';
import styles from './titleCard.module.scss';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { defaultChartOptions } from '@lib/chartOptions';
import titleCardDataX from './accel_x.csv?raw';
import titleCardDataY from './accel_y.csv?raw';
import titleCardDataZ from './accel_z.csv?raw';
import { getHeadersIndex } from '@lib/chartUtils';
import { seriesData } from '@types';

const parseData = (csvData: string): number[][] => {
  const lines = csvData.trim().split('\n').map(line => line.split(','));
  const headers = lines[0];
  const columns = [
    { dataType: headers[0], source: '' },
    { dataType: headers[1], source: '' }
  ];
  const headerIndices = getHeadersIndex(headers, columns);
  const timestampOffset = new Date();
  const series: seriesData = lines.slice(1).map((line) => {
    return [parseFloat(line[headerIndices.x]) + timestampOffset.getTime(), parseFloat(line[headerIndices.y])];
  });
  return series;
};

export const TitleCard = () => {
  const [chartData, setChartData] = useState<number[][][]>([]);
        
  useEffect(() => {
    setChartData([parseData(titleCardDataX), parseData(titleCardDataY), parseData(titleCardDataZ)]);
  }, []);

  const options: Highcharts.Options = {
    ...defaultChartOptions, 
    chart: {
      ...defaultChartOptions.chart,
      backgroundColor: 'transparent',
      height: 275,
    },
    subtitle: {
      text: ''
    },
    xAxis: {
      gridLineColor: 'transparent',
      labels: { enabled: false },
      type: 'datetime',
    },
    yAxis: {
      title: {text: ''},
      gridLineColor: 'transparent',
      tickPositions: [-2.3, 2], // Needed to allow custom sizing
    },
    legend: {
      enabled: false
    },
    series: chartData.map((data, index) => ({
      type: 'spline',
      data,
      name: ['X', 'Y', 'Z'][index],
    })),
  };
  return (
    <div className={styles.titleCard}>
      <div className={styles.textContainer}>
        <div className={styles.title}>
          <span className={styles.highlight1}>VISUALIZE</span> YOUR <br/>
            DATA, YOUR <span className={styles.highlight2}>WAY </span>
        </div>
        <div className={styles.description}>
          Transform raw data into compelling visuals effortlessly. 
          Dive deep, discover patterns, and let your data tell its story.
        </div>
      </div>
      <div className={styles.graphContainer}>
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
        />
      </div>
    </div>
  );
};