import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Eevee } from './Eevee';
import { useRef } from 'react';
import { fetchData, ModelReplayController } from '@lib/modelUtils';
import './modelViewer.css';
import { ApiUtil } from '@lib/apiUtils';
import { ReplayEvent, ReplayEventType, StateType, quatReplayData } from '@types';
import { showInfoToast } from '@components/ui/toastNotification/ToastNotification';

const ModelViewer = () => {
  const objRef = useRef<THREE.Group>(undefined);
  const [data, setData] = useState<quatReplayData>([]);
  const [objectLoaded, setObjectLoaded] = useState(false);
  const [bins, setBins] = useState<string[]>([]);
  const replayControllerRef = useRef<ModelReplayController | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [currentState, setCurrentState] = useState(StateType.Stopped);

  // Handle replay events
  const handleEvent = (event: ReplayEvent) => {
    switch (event.type) {
      case ReplayEventType.StateChanged:
        setCurrentState(event.state);
        break;
      case ReplayEventType.Progress:
        setCurrentIndex(event.currentIndex);
        setCurrentTimestamp(event.timestamp);
        break;
      case ReplayEventType.Finished:
        showInfoToast('Replay finished!', JSON.stringify(event));
        break;
    }
  };

  useEffect(() => {
    ApiUtil.getBins().then(bins => setBins(bins.map(bin => bin.key)));
  }, []);

  // Setup the replay controller
  useEffect(() => {
    if (!objRef.current || !objectLoaded || data.length <= 0) return;
    replayControllerRef.current = new ModelReplayController(data, objRef.current, 'quaternion');

    replayControllerRef.current.on(handleEvent);

    return () => {
      replayControllerRef.current?.off(handleEvent);
    };
  }, [data, objectLoaded]);

  const handleBinChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!event.target.value) return;
    fetchData(event.target.value).then(setData);
  };

  return (
    <div className="modelContainer">
      
      <div className={'control-bar'}>
        <select className="model_bin_select" defaultValue="none" onChange={handleBinChange}>
          <option value="none" disabled hidden>Select a file to analyze</option>
          {bins.map((bin) => {
            return (<option key={bin} value={bin}>{bin}</option>);
          })}
        </select>
        <button onClick={() => replayControllerRef.current?.play()}>Play</button>
        <button onClick={() => replayControllerRef.current?.stop()}>Stop</button>
        <button onClick={() => replayControllerRef.current?.pause()}>Pause</button>
        <button onClick={() => replayControllerRef.current?.reset()}>Reset</button>
        <div>
          <label>Speed:</label>
          <input 
            type="number" 
            min="0" 
            step="0.1"
            defaultValue="1" 
            onChange={(e) => replayControllerRef.current?.setSpeed(parseFloat(e.target.value))} 
          />
        </div>
        <div>
          <label>Current Index: </label>
          <span>{currentIndex}</span>
        </div>
        <div>
          <label>Current Timestamp: </label>
          <span>{currentTimestamp}</span>
        </div>
        <div>
          <label>Current State: </label>
          <span>{currentState}</span>
        </div>
      </div>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 40, position: [40, 0, 0] }}>
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
    </div>
    
  );
};

export default ModelViewer;