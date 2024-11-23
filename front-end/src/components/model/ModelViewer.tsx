import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Eevee } from './Eevee.js';
import { useRef } from 'react';
import { fetchData, ModelReplayController } from '@lib/modelUtils.js';
import './modelViewer.css';
import { ApiUtil } from '@lib/apiUtils.js';
import { ReplayEvent, ReplayEventType, quatReplayData } from '@types';

const ModelViewer = () => {
  const objRef = useRef<THREE.Group>();
  const [data, setData] = useState<quatReplayData>([]);
  const [objectLoaded, setObjectLoaded] = useState(false);
  const [bins, setBins] = useState<string[]>([]);
  let replayController: ModelReplayController;

  useEffect(() => {
    ApiUtil.getBins().then(bins => setBins(bins));
  }, []);

  const handleEvent = (event: ReplayEvent) => {
    switch (event.type) {
      case ReplayEventType.StateChanged:
        console.log('State changed:', event.state);
        break;
      case ReplayEventType.Progress:
        console.log('Progress:', event.currentIndex, event.timestamp);
        break;
      case ReplayEventType.Finished:
        console.log('Replay finished!', event);
        break;
    }
  };

  useEffect(() => {
    if (!objRef.current || !objectLoaded || data.length <= 0) return;
    console.log('Data:', data, 'objRef:', objRef.current);
    replayController = new ModelReplayController(data, objRef.current, 'quaternion');

    replayController.on(handleEvent);

    return () => {
      replayController?.off(handleEvent);

    };
  }, [data, objectLoaded]);

  const handleBinChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!event.target.value) return;
    fetchData(event.target.value).then(setData);
  };

  return (
    <div className="modelContainer">
      <select className="model_bin_select" defaultValue="none" onChange={handleBinChange}>
        <option value="none" disabled hidden>Select a file to analyze</option>
        {bins.map((bin) => {
          return (<option key={bin} value={bin}>{bin}</option>);
        })}
      </select>
      <button onClick={() => replayController.play()}>Play</button>
      <button onClick={() => replayController.pause()}>Pause</button>
      <button onClick={() => replayController.stop()}>Stop</button>
      <button onClick={() => replayController.reset()}>Reset</button>
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