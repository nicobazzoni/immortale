import { useGLTF } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useRayShooter from './useRayShooter';
import { useThree } from '@react-three/fiber';
export default function Character({ url, position = [0, 0, 0], isPlayer = false, targetRef }) {
  const groupRef = useRef();
  const mixer = useRef(null);
  const actions = useRef({});
  const currentAction = useRef(null);
  const [keys, setKeys] = useState({});
  const lastAttackTime = useRef(0);

  const { scene, animations } = useGLTF(url);
  const { scene: flashGLB } = useGLTF('https://storage.googleapis.com/new-music/need_the_flash_of_a_g_0518231622_texture.glb');
  const { camera } = useThree();

  const playAnimation = (name) => {
    const action = actions.current[name];
    if (!action || currentAction.current === action) return;
    currentAction.current?.fadeOut(0.2);
    action.reset().fadeIn(0.2).play();
    currentAction.current = action;
  
    const gun = scene.getObjectByName('gun');
    if (gun) {
      gun.visible = true;
      gun.scale.set(15, 15, 15);
      gun.updateMatrixWorld(true);
    }
  };

  useFrame((_, delta) => {
    mixer.current?.update(delta);
    rayShooter.updateParticles(delta);
  
    if (!isPlayer || !groupRef.current) return;
  
    const moveSpeed = 0.1;
    const moveX = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0);
    const moveZ = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0);
  
    const hasMovement = moveX !== 0 || moveZ !== 0;
  
    if (hasMovement) {
      const inputDir = new THREE.Vector3(moveX, 0, moveZ).normalize();
  
      // Get the direction the camera is facing
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      camDir.y = 0;
      camDir.normalize();
  
      // Create rotation based on camera
      const angleToCam = Math.atan2(camDir.x, camDir.z);
      inputDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleToCam);
  
      // Move player
      groupRef.current.position.add(inputDir.clone().multiplyScalar(moveSpeed));
  
      // Rotate to face direction
      const targetAngle = Math.atan2(inputDir.x, inputDir.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetAngle,
        0.2
      );
  
      playAnimation('walk');
    } else {
      playAnimation('idle');
    }
  
    // Shoot anytime 'p' is pressed (even while walking)
    if (keys['p']) {
      playAnimation('shoot');
      rayShooter.shoot();
  
      const gun = scene.getObjectByName('gun');
      if (gun && flashGLB) {
        const flash = flashGLB.clone();
        flash.scale.set(3, 3, 3);
        flash.position.set(-0.2, 0, 0);
        gun.add(flash);
        setTimeout(() => gun.remove(flash), 60);
      }
    }
  
    // Camera follows behind player
    const targetPos = groupRef.current.position.clone();
    const behindOffset = new THREE.Vector3(0, 2.5, -6); // behind and above
    behindOffset.applyQuaternion(groupRef.current.quaternion);
    const camPos = targetPos.clone().add(behindOffset);
  
    camera.position.lerp(camPos, 0.1);
    camera.lookAt(targetPos);
  });
  useEffect(() => {
    if (!scene || animations.length === 0) return;

    const armatureRoot =
      scene.getObjectByName('Armature') ||
      scene.getObjectByName('Armature.001') ||
      scene.getObjectByProperty('type', 'SkinnedMesh')?.skeleton?.bones[0]?.parent ||
      scene;

    mixer.current = new THREE.AnimationMixer(armatureRoot);

    const seen = new Set();
    const uniqueClips = animations.filter((clip) => {
      if (seen.has(clip.name)) return false;
      seen.add(clip.name);
      return true;
    });

    const availableClips = ['idle', 'walk', 'shoot'];
    availableClips.forEach((key) => {
      const clip = uniqueClips.find((clip) => clip.name.toLowerCase().includes(key));
      if (clip) actions.current[key] = mixer.current.clipAction(clip);
    });

    setTimeout(() => {
      if (actions.current['idle']) playAnimation('idle');
    }, 100);

    return () => mixer.current.stopAllAction();
  }, [scene, animations, url]);

  const muzzle = scene.getObjectByName('muzzle') || scene.getObjectByName('gun');

  const rayShooter = useRayShooter({
    getSource: () => {
      if (!muzzle) return new THREE.Vector3();
      const offset = new THREE.Vector3(2, 4, 5);
      muzzle.updateWorldMatrix(true, false);
      return muzzle.localToWorld(offset);
    },
    getDirection: () => {
      if (!muzzle) return new THREE.Vector3(0, 0, 3);
      const localForward = new THREE.Vector3(0, 0, -1);
      return localForward.applyQuaternion(muzzle.getWorldQuaternion(new THREE.Quaternion())).normalize();
    },
  });

  useEffect(() => {
    if (!isPlayer) return;
    const down = (e) => setKeys((k) => ({ ...k, [e.key.toLowerCase()]: true }));
    const up = (e) => setKeys((k) => ({ ...k, [e.key.toLowerCase()]: false }));
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [isPlayer]);

  
  return (
    <group ref={groupRef} position={position}>
      <primitive object={scene} scale={[1.5, 1.5, 1.5]} />
    </group>
  );
}
