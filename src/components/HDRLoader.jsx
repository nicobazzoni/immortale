import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

export default function HDRLoader({ path }) {
  const { scene, gl } = useThree();

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();

    new RGBELoader().load(path, (hdrTexture) => {
      const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
      scene.environment = envMap;
      scene.background = envMap;
      hdrTexture.dispose();
    });
  }, [gl, scene, path]);

  return null;
}