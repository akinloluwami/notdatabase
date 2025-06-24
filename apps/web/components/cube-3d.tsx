"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Environment } from "@react-three/drei";
import { useRef } from "react";
import { Mesh } from "three";

function AnimatedBox() {
  const boxRef = useRef<Mesh>(null);
  useFrame(() => {
    if (boxRef.current) {
      boxRef.current.rotation.y += 0.003;
      boxRef.current.rotation.x += 0.0015;
    }
  });
  return (
    <RoundedBox
      ref={boxRef}
      args={[1, 0.8, 1]}
      radius={0.03}
      rotation={[0.4, 0.7, 0]}
      scale={1.5}
    >
      <meshPhysicalMaterial
        color="#444"
        metalness={1}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0}
        reflectivity={1}
      />
    </RoundedBox>
  );
}

export default function Cube3D({ padding = 0.05 }: { padding?: number }) {
  // Calculate camera distance so the cube fills the view with padding
  // The cube's largest dimension is 1.5 (scale) * 1 (args[0]) = 1.5
  // Use a perspective camera with fov 50 (default)
  // Distance = (cubeSize/2) / tan(fov/2) / (1 - padding)
  // For fov=50deg, tan(25deg) ≈ 0.466
  const cubeSize = 1.5;
  const fov = 50;
  const rad = (fov / 2) * (Math.PI / 180);
  const distance = cubeSize / 2 / Math.tan(rad) / (1 - padding);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        style={{ width: "100%", height: "100%", display: "block" }}
        camera={{ position: [distance, distance, distance], fov }}
      >
        <ambientLight intensity={0.1} />
        <spotLight
          position={[5, 10, 5]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <AnimatedBox />
        <Environment preset="warehouse" background={false} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
}
