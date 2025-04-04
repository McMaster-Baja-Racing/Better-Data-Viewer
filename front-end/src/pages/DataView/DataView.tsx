import { ChartInformation } from "@types";
import Chart from "@components/views/Chart/Chart";
import { GraphWrapper } from "@components/graphWrapper/GraphWrapper";
import { RightSidebar } from "@components/rightSidebar/RightSidebar";
import { useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import styles from "./DataView.module.scss";

export const DataView = () => {
  const location = useLocation();
  const { chartInformation } = (location.state || {}) as { chartInformation: ChartInformation };

  // Store the chart information in state so it doesn't update on every render.
  const [data] = useState(chartInformation);
  const [isOpen, setIsOpen] = useState(true);

  // Memoize the video object to prevent re-creation on every render.
  const video = useMemo(() => ({
    key: '',
    start: new Date(),
    end: new Date()
  }), []);


  return (
    // TODO: Extract this title better
      <RightSidebar 
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        mainContent={
          <GraphWrapper title={
            chartInformation.files[0].columns[1].header 
            + ' vs ' 
            + chartInformation.files[0].columns[0].header
          }
            editOnClick={() => setIsOpen(!isOpen)}
          >
            {/* <Chart 
              chartInformation={data}
              video={video}
              videoTimestamp={0}
            /> */}
            Oooga booga
          </GraphWrapper>
        }
        sidebarContent={<div>Hai</div>}
      />
  );
}