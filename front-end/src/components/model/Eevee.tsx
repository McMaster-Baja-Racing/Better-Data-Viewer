import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { GridHelper, AxesHelper, BoxHelper } from 'three';
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
  const boxHelperRef = useRef<BoxHelper | null>(null);

  // Execute every frame
  useFrame(() => {
    if (boxHelperRef.current) {
      boxHelperRef.current.update();
    }
  });

  // Load the objects into the scene
  useEffect(() => {
    const loader = new OBJLoader();

    loader.load(EeveeObj, (object) => {
      // Add the loaded object to the scene
      scene.add(object);
      objRef.current = object;

      const boxHelper = boxHelperRef.current = new BoxHelper(object, 0xffff00);
      scene.add(boxHelper);

      if (onLoad) onLoad();
    });

    const gridHelper = new GridHelper(1000, 100);
    gridHelper.position.y = -11;
    scene.add(gridHelper);

    const axesHelper = new AxesHelper(40);
    scene.add(axesHelper);

    // Cleanup on component unmount
    return () => {
      if (objRef.current) {
        scene.remove(objRef.current);
      }
      if (boxHelperRef.current) {
        scene.remove(boxHelperRef.current);
      }
      scene.remove(gridHelper);
      scene.remove(axesHelper);

    };
  }, [scene]);

  return (
    <group>
    </group>
  );
}