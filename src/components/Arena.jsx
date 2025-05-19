import { useGLTF } from '@react-three/drei';

export default function Arena() {
  const { scene } = useGLTF('https://storage.googleapis.com/new-music/scampia.glb');
  return <primitive object={scene} position={[20, 0, 0]} scale={[5, 5, 5]} />;
}