import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export default function Ground() {
  const texture = useLoader(THREE.TextureLoader, '/public/grainy-concrete_albedo.png');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 20);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} scale={[10, 10, 10]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
