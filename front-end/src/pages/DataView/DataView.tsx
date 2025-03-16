import { ChartInformation } from "@types";
import Chart from "@components/views/Chart/Chart";

interface DataViewProps {
  chartInformation: ChartInformation;
}

export const DataView = ({chartInformation}: DataViewProps) => {

  return (
    <Chart chartInformation={chartInformation} video={{key: '', start: new Date(), end: new Date()}} videoTimestamp={0}/>
  )
}