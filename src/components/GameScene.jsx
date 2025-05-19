import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Ground from './Ground';
import Arena from './Arena';
import HDRLoader from './HDRLoader';
import Character from './Character';
import { useRef } from 'react';

export default function GameScene() {
  const playerRef = useRef();

  return (
    <div className="canvas-container">
      <img
        src="/mountainssecondelgiano.hdr"
        alt="Scampia Mountains"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      <Canvas
        shadows
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10,
        }}
        camera={{ position: [0, 2, 20], fov: 60 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        <HDRLoader path="/mountainssecondelgiano.hdr" />
        <Ground />
        <Arena />

        {/* Genny = AI */}
        <Character
          url="https://storage.googleapis.com/new-music/genny4.glb"
          isPlayer={false}
          position={[-2, 0, 0]}
          ref={playerRef}
        />

        {/* Ciro = player */}
        <Character
          url="https://storage.googleapis.com/new-music/cirowithgunagain6.glb"
          isPlayer={true}
          position={[2, 0, 0]}
          targetRef={playerRef}
        />

        <OrbitControls />
      </Canvas>
    </div>
  );
}