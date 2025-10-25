import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { GridHelper } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import EeveeObj from '@assets/Eevee.obj';

//props to pass in rotation through euler angles
interface EeveeProps {
  objRef: React.MutableRefObject<THREE.Group | undefined>;
  onLoad?: () => void;
}

export function Eevee({ objRef, onLoad }: EeveeProps) {
  const { scene } = useThree();

  // Load the objects into the scene
  useEffect(() => {
    const loader = new OBJLoader();

    loader.load(EeveeObj, (object) => {
      // Add the loaded object to the scene
      scene.add(object);
      objRef.current = object;

      if (onLoad) onLoad();
    });

    const gridHelper = new GridHelper(1000, 100);
    gridHelper.position.y = -11;
    scene.add(gridHelper);

    // Cleanup on component unmount
    return () => {
      if (objRef.current) {
        scene.remove(objRef.current);
      }
      scene.remove(gridHelper);
    };
  }, [scene]);

  return (
    <group>
    </group>
  );
}