import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { GridHelper, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';
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
    
    let object: THREE.Group | null = null;
    let sphereMesh: Mesh | null = null;
    let gridHelper: GridHelper | null = null;

    loader.load(EeveeObj, (loaded) => {
      object = loaded;
      scene.add(object);
      objRef.current = object;

      const boundingRadius = getBoundingRadius(object) || 1;
      sphereMesh = createSphereMesh(boundingRadius);
      scene.add(sphereMesh);

      gridHelper = new GridHelper(1000, 100);
      gridHelper.position.y = -(boundingRadius + 10);
      scene.add(gridHelper);

      onLoad?.();
    });

    // Cleanup on component unmount
    return () => {
      if (object) scene.remove(object);
      if (sphereMesh) {
        scene.remove(sphereMesh);
        sphereMesh.geometry.dispose();
        (sphereMesh.material as MeshBasicMaterial).dispose();
      }
      if (gridHelper) scene.remove(gridHelper);
      objRef.current = undefined;
    };
  }, [scene]);

  return (
    <group>
    </group>
  );
}