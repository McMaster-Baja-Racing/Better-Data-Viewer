import { ChartInformation } from "@types";
import Chart from "@components/views/Chart/Chart";
import { GraphWrapper } from "@components/graphWrapper/GraphWrapper";
import { useLocation } from "react-router-dom";
import { useMemo, useState } from "react";

export const DataView = () => {
  const location = useLocation();
  const { chartInformation } = (location.state || {}) as { chartInformation: ChartInformation };

  // Store the chart information in state so it doesn't update on every render.
  const [data] = useState(chartInformation);

  // Memoize the video object to prevent re-creation on every render.
  const video = useMemo(() => ({
    key: '',
    start: new Date(),
    end: new Date()
  }), []);

  return (
    // TODO: Extract this title better
    <GraphWrapper title={
      chartInformation.files[0].columns[1].header 
      + ' vs ' 
      + chartInformation.files[0].columns[0].header
    }>
      <Chart 
        chartInformation={data} 
        video={video} 
        videoTimestamp={0}
      />
    </GraphWrapper>
  );
}