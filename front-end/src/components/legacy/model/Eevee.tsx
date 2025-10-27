import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, GridHelper, Mesh, MeshBasicMaterial, Sphere, SphereGeometry } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import EeveeObj from '@assets/Eevee.obj';
import { getBoundingRadius } from '@lib/modelUtils';

//props to pass in rotation through euler angles
interface EeveeProps {
  objRef: React.MutableRefObject<THREE.Group | undefined>;
  onLoad?: () => void;
}

const createSphereMesh = (radius: number): Mesh => {
  const geometry = new SphereGeometry(radius, 24, 24);
  const material = new MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });
  return new Mesh(geometry, material);
};

export function Eevee({ objRef, onLoad }: EeveeProps) {
  const { scene } = useThree();

  // Load the objects into the scene
  useEffect(() => {
    const loader = new OBJLoader();

    loader.load(EeveeObj, (object) => {
      // Add the loaded object to the scene
      scene.add(object);
      objRef.current = object;

      // Create sphere mesh and grid for reference
      const boundingRadius = getBoundingRadius(object) || 1;
      const sphereMesh = createSphereMesh(boundingRadius);
      scene.add(sphereMesh);

      const gridHelper = new GridHelper(1000, 100);
      gridHelper.position.y = -(boundingRadius + 10);
      scene.add(gridHelper);

      if (onLoad) onLoad();
    });



    // Cleanup on component unmount
    return () => {
      if (objRef.current) {
        scene.remove(objRef.current);
      }
    };
  }, [scene]);

  return (
    <group>
    </group>
  );
}