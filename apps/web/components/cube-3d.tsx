"use client";

import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Environment } from "@react-three/drei";
import { useRef, useState, useCallback } from "react";
import { Mesh, MathUtils, Color } from "three";

function AnimatedBox() {
  const boxRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const targetScale = useRef(1.5);
  const currentScale = useRef(1.5);
  const spinBoost = useRef(0);
  const targetColor = useRef(new Color("#1a1a1a"));
  const currentColor = useRef(new Color("#1a1a1a"));

  const handlePointerOver = useCallback(() => {
    setHovered(true);
    document.body.style.cursor = "grab";
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "auto";
  }, []);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setClicked((prev) => !prev);
    spinBoost.current = 0.08;
  }, []);

  useFrame((_, delta) => {
    if (!boxRef.current) return;

    const desiredScale = clicked ? 1.7 : hovered ? 1.6 : 1.5;
    targetScale.current = desiredScale;
    currentScale.current = MathUtils.lerp(
      currentScale.current,
      targetScale.current,
      delta * 6
    );
    boxRef.current.scale.setScalar(currentScale.current);

    const baseSpeed = hovered ? 0.008 : 0.003;
    spinBoost.current = MathUtils.lerp(spinBoost.current, 0, delta * 3);
    const speed = baseSpeed + spinBoost.current;
    boxRef.current.rotation.y -= speed;

    const desiredColor = clicked
      ? new Color("#2a2a2a")
      : hovered
        ? new Color("#222222")
        : new Color("#1a1a1a");
    targetColor.current.copy(desiredColor);
    currentColor.current.lerp(targetColor.current, delta * 5);

    const mat = boxRef.current.material as any;
    if (mat?.color) {
      mat.color.copy(currentColor.current);
    }
  });

  return (
    <RoundedBox
      ref={boxRef}
      args={[1, 0.75, 1]}
      radius={0.06}
      rotation={[0.4, -0.6, 0]}
      scale={1.5}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <meshPhysicalMaterial
        color="#1a1a1a"
        metalness={0.6}
        roughness={0.55}
        clearcoat={0.3}
        clearcoatRoughness={0.4}
        reflectivity={0.4}
        sheen={0.4}
        sheenRoughness={0.8}
        sheenColor="#333333"
        envMapIntensity={0.8}
      />
    </RoundedBox>
  );
}

export default function Cube3D({ padding = 0.05 }: { padding?: number }) {
  const fov = 35;
  const distance = 3.5;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        style={{ width: "100%", height: "100%", display: "block" }}
        camera={{ position: [0, distance * 0.5, distance], fov, near: 0.1, far: 100 }}
      >
        <ambientLight intensity={0.5} />
        <spotLight
          position={[5, 8, 6]}
          angle={0.5}
          penumbra={1}
          intensity={1.5}
          castShadow
        />
        <directionalLight position={[-4, 4, 2]} intensity={0.6} />
        <directionalLight position={[3, 2, -3]} intensity={0.3} />
        <pointLight position={[0, -2, 4]} intensity={0.3} color="#ffffff" />
        <AnimatedBox />
        <Environment preset="city" background={false} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          autoRotate={false}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
