import { useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

export default function useRayShooter({ getSource, getDirection }) {
  const { scene } = useThree();
  const particles = useRef([]);

  const shoot = (targets = []) => {
    if (!getSource || !getDirection || !scene) return;

    const origin = getSource();
    const dir = getDirection();

    console.log('🔫 Shooting from', origin.toArray(), '→', dir.toArray());

    const ray = new THREE.Raycaster(origin, dir);
    const intersects = ray.intersectObjects(targets, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      spawnParticle(hit.point);
      console.log('🎯 Hit at', hit.point.toArray());
    } else {
      // Optional: visual tracer even on miss
      const missPoint = origin.clone().add(dir.clone().multiplyScalar(10));
      spawnParticle(missPoint);
      console.log('💨 Miss');
    }
  };
  const spawnParticle = (pos) => {
    const geo = new THREE.SphereGeometry(0.15, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,                // Core white
      emissive: new THREE.Color(0xff00ff), // Fuchsia glow
      emissiveIntensity: 20,
      toneMapped: false,
      transparent: true,
      opacity: 0.9,
    });
  
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos.clone().add(new THREE.Vector3(0.5, 0.1, 10.5)));
    mesh.scale.set(0.5, 0.5, 0.5);
    scene.add(mesh);
  
    particles.current.push({ mesh, ttl: 1 });
  };

  const updateParticles = (delta) => {
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.ttl -= delta;

      // Optional: shrink particle over time
      const s = Math.max(0, p.ttl * 2);
      p.mesh.scale.set(s, s, s);

      if (p.ttl <= 0) {
        scene.remove(p.mesh);
        particles.current.splice(i, 1);
      }
    }
  };

  return { shoot, updateParticles };
}