import { ChartInformation } from "@types";
import Chart from "@components/views/Chart/Chart";
import { useLocation } from "react-router-dom";

export const DataView = () => {
  const location = useLocation();
  const { chartInformation } = (location.state || {}) as { chartInformation: ChartInformation };

  return (
    <Chart 
      chartInformation={chartInformation} 
      video={{key: '', start: new Date(), end: new Date()}} 
      videoTimestamp={0}
    />
  )
}