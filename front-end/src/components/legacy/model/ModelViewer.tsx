import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Eevee } from './Eevee';
import { useRef } from 'react';
import { fetchData, ModelReplayController, ReplayAccelSubscriber, ReplayModelSubscriber } from '@lib/modelUtils';
import './modelViewer.css';
import { ApiUtil } from '@lib/apiUtils';
import {ReplayEventType, replayData } from '@types';
import { showInfoToast } from '@components/ui/toastNotification/ToastNotification';
import { Playbar } from '@components/ui/playbar/Playbar';

const ModelViewer = () => {
  const objRef = useRef<THREE.Group>(undefined);
  const [data, setData] = useState<replayData>([]);
  const [objectLoaded, setObjectLoaded] = useState(false);
  const [bins, setBins] = useState<string[]>([]);
  const [replayController, setReplayController] = useState<ModelReplayController | null>(null);
  const [times, setTimes] = useState<number[]>([]);
  const [accelDisplay, setAccelDisplay] = useState({ax: 0, ay: 0, az: 0, net: 0});

  useEffect(() => {
    ApiUtil.getBins().then(bins => setBins(bins.map(bin => bin.key)));
  }, []);

  // Setup the replay controller
  useEffect(() => {
    if (!objectLoaded || !objRef.current || data.length === 0) return;

    const controller = new ModelReplayController(data);
    setReplayController(controller);

    const modelSubscriber = new ReplayModelSubscriber(objRef.current, controller, data);
    const accelSubscriber = new ReplayAccelSubscriber(controller, (vals) => {setAccelDisplay(vals);});

    const cleanupController = controller.on((event) => {
      if (event.type === ReplayEventType.Finished) {
        showInfoToast('Replay finished!');
      }
    });

    // Cleanup
    return () => {
      cleanupController();
      accelSubscriber.dispose();
      modelSubscriber.dispose();
      controller.dispose();
    };
  }, [objectLoaded, data]);

  const handleBinChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!event.target.value) return;
    const loaded = await fetchData(event.target.value);

    // Normalize timestamps to start at 0
    const offset = loaded[0]?.timestamp || 0;
    const shifted = loaded.map(d => ({ ...d, timestamp: d.timestamp - offset }));
    setData(shifted);
    setTimes(shifted.map(d => d.timestamp / 1000)); // convert to seconds for Playbar
  };

  const accelItems = [
    { label: 'Accel X:', value: accelDisplay.ax },
    { label: 'Accel Y:', value: accelDisplay.ay },
    { label: 'Accel Z:', value: accelDisplay.az },
    { label: 'Net Accel:', value: accelDisplay.net }
  ];

  return (
    <div className="modelContainer">
      <div className="control-bar">
        <select className="model_bin_select" defaultValue="none" onChange={handleBinChange}>
          <option value="none" disabled hidden>Select a file to analyze</option>
          {bins.map((bin) => {
            return (<option key={bin} value={bin}>{bin}</option>);
          })}
        </select>
        <div className="accelDisplay">
          {accelItems.map((item) => (
            <div className="accelItem" key={item.label}>
              <span>{item.label}</span>
              <span className="accelValue">{item.value.toFixed(2)}</span>
              <span>m/s²</span>
            </div>
          ))}
        </div>
      </div>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 40, position: [20, 20, 20] }}>
        <Suspense fallback={null}>
          <Stage preset="rembrandt" intensity={1} environment="lobby">
            <directionalLight position={[-5, 10, -35]} intensity={2.0} color="red" />
            <directionalLight position={[5, 10, 5]} intensity={2.0}  color="blue"/>
            <ambientLight intensity={0.3} />
            <Eevee objRef={objRef} onLoad={() => setObjectLoaded(true)}/>
          </Stage>
        </Suspense>
        <OrbitControls/> {/* autoRotate */}
      </Canvas>
      <div className="playbarContainer">
        {replayController && times.length > 0 && (
          <Playbar replayController={replayController} times={times} />
        )}
      </div>
    </div>
    
  );
};

export default ModelViewer;