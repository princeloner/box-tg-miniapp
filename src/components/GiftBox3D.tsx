import React, { useRef, useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useFrame } from '@react-three/fiber';
import { Group, MeshStandardMaterial, MeshPhysicalMaterial, Color, Mesh } from 'three';

interface GiftBox3DProps {
  isOpening: boolean;
  isGolden: boolean;
  isRainbow: boolean;
  isMystic: boolean;
}

export function GiftBox3D({ isOpening, isGolden, isRainbow, isMystic }: GiftBox3DProps) {
  const groupRef = useRef<Group>(null);
  const [regularModel, setRegularModel] = useState<any>(null);
  const [goldenModel, setGoldenModel] = useState<any>(null);
  const [rainbowModel, setRainbowModel] = useState<any>(null);
  const [mysticModel, setMysticModel] = useState<any>(null);

  useEffect(() => {
    new GLTFLoader().load('/gift/scene.gltf', (gltf) => {
      setupModel(gltf, 'regular');
      setRegularModel(gltf.scene);
    });

    new GLTFLoader().load('/gift_box_golden_gift_box/scene.gltf', (gltf) => {
      setupModel(gltf, 'golden');
      setGoldenModel(gltf.scene);
    });

    new GLTFLoader().load('/rainbow_gift/scene.gltf', (gltf) => {
      setupModel(gltf, 'rainbow');
      setRainbowModel(gltf.scene);
    });

    new GLTFLoader().load('/mystic_gift/scene.gltf', (gltf) => {
      setupModel(gltf, 'mystic');
      gltf.scene.traverse((child) => {
        if (child instanceof Mesh) {
          child.material = new MeshPhysicalMaterial({
            color: new Color("#4B0082"),
            metalness: 0.9,
            roughness: 0.1,
            emissive: new Color("#0b6be0"),
            emissiveIntensity: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
          });
        }
      });
      setMysticModel(gltf.scene);
    });
  }, []);

  const setupModel = (gltf: any, type: 'regular' | 'golden' | 'rainbow' | 'mystic') => {
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        if (type === 'rainbow') {
          child.material = new MeshStandardMaterial({
            color: '#FFD700',
            roughness: 0.1,
            metalness: 0.9,
            envMapIntensity: 3
          });
        } else if (type === 'golden' && (child.material.name === 'material' || child.material.name === 'Material.001')) {
          child.material = new MeshStandardMaterial({
            color: '#FFD700',
            roughness: 0.1,
            metalness: 0.9,
            envMapIntensity: 3
          });
        } else if (type === 'golden' && (child.material.name === 'Ribbon' || child.material.name === 'Material')) {
          child.material = new MeshStandardMaterial({
            color: '#ffd700',
            roughness: 0.4,
            metalness: 0.8,
            envMapIntensity: 2.5
          });
        } else if (type === 'regular') {
          if (child.material.name === 'material' || child.material.name === 'Material.001') {
            child.material = new MeshStandardMaterial({
              color: '#ff0004',
              roughness: 0.3,
              metalness: 0.2,
              envMapIntensity: 1.5
            });
          } else {
            child.material = new MeshStandardMaterial({
              color: '#247531',
              roughness: 0.4,
              metalness: 0.6,
              envMapIntensity: 1.2
            });
          }
        } else if (type === 'mystic') {
          child.material = new MeshStandardMaterial({
            color: '#4b0082',
            roughness: 0.1,
            metalness: 1,
            envMapIntensity: 3.5,
            emissive: '#800080',
            emissiveIntensity: 0.5
          });
        }
      }
    });

    if (type === 'rainbow') {
      gltf.scene.rotation.x = -Math.PI / 4;
      gltf.scene.position.y = -0.2;
      gltf.scene.scale.set(0.7, 0.7, 0.7);
    } else if (type === 'golden') {
      gltf.scene.rotation.x = -Math.PI / 6;
      gltf.scene.position.y = -0.3;
      gltf.scene.scale.set(0.8, 0.8, 0.8);
    } else if (type === 'mystic') {
      gltf.scene.rotation.x = -Math.PI / 3;
      gltf.scene.position.y = -0.2;
      gltf.scene.scale.set(0.65, 0.65, 0.65);
    } else {
      gltf.scene.rotation.x = -Math.PI / 12;
      gltf.scene.position.y = -0.3;
      gltf.scene.position.z = 0;
      gltf.scene.scale.set(0.6, 0.6, 0.6);
    }
  };

  useFrame((state) => {
    if (groupRef.current) {
      if (isMystic) {
        groupRef.current.rotation.y += 0.01;
        const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        groupRef.current.scale.set(0.65 * pulseScale, 0.65 * pulseScale, 0.65 * pulseScale);
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05 - 0.2;
      } else if (!isOpening) {
        groupRef.current.rotation.y += 0.01;
        if (!isGolden && !isRainbow) {
          const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.03;
          groupRef.current.scale.set(0.6 * pulseScale, 0.6 * pulseScale, 0.6 * pulseScale);
        }
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05 + (isGolden || isRainbow ? -0.3 : -0.3);
      } else {
        groupRef.current.rotation.y += 0.1;
        const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
        groupRef.current.scale.set(scale, scale, scale);
      }
    }
  });

  return (
    <>
      <ambientLight intensity={isMystic ? 0.4 : isRainbow ? 2 : isGolden ? 1.5 : 0.8} />
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={isMystic ? 1.2 : isRainbow ? 2.5 : isGolden ? 2 : 1.2} 
        castShadow 
      />
      <directionalLight 
        position={[-5, -5, -5]} 
        intensity={isRainbow ? 1 : isGolden ? 0.8 : 0.3} 
      />
      <pointLight 
        position={[0, 5, 0]} 
        intensity={isRainbow ? 1.5 : isGolden ? 1.2 : 0.5}
        distance={10}
        decay={2}
      />
      <spotLight
        position={[0, 8, 0]}
        angle={0.4}
        penumbra={1}
        intensity={isRainbow ? 1.5 : isGolden ? 1.2 : 0.6}
        castShadow
      />
      {(isGolden || isRainbow) && (
        <>
          <pointLight
            position={[3, 2, 3]}
            intensity={isRainbow ? 0.8 : 0.6}
            distance={8}
            decay={2}
          />
          <pointLight
            position={[-3, 2, -3]}
            intensity={isRainbow ? 0.8 : 0.6}
            distance={8}
            decay={2}
          />
        </>
      )}
      <group ref={groupRef}>
        {isMystic && mysticModel ? (
          <primitive object={mysticModel} />
        ) : isRainbow && rainbowModel ? (
          <primitive object={rainbowModel} />
        ) : isGolden && goldenModel ? (
          <primitive object={goldenModel} />
        ) : regularModel ? (
          <primitive object={regularModel} />
        ) : null}
      </group>
    </>
  );
} 