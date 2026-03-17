import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PAGE_WIDTH = 2;
const PAGE_HEIGHT = 2.8;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;

interface BookPage3DProps {
  frontTexture: THREE.Texture;
  backTexture: THREE.Texture;
  pageIndex: number;
  isFlipped: boolean;
  totalPages: number;
  isCover?: boolean;
}

const BookPage3D = ({
  frontTexture,
  backTexture,
  pageIndex,
  isFlipped,
  totalPages,
  isCover = false,
}: BookPage3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const currentAngle = useRef(0);
  const targetAngle = isFlipped ? -Math.PI : 0;

  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(
      PAGE_WIDTH,
      PAGE_HEIGHT,
      isCover ? PAGE_DEPTH * 4 : PAGE_DEPTH,
      PAGE_SEGMENTS,
      1,
      1
    );
    return geo;
  }, [isCover]);

  const materials = useMemo(() => {
    const frontMat = new THREE.MeshStandardMaterial({
      map: frontTexture,
      roughness: isCover ? 0.6 : 0.8,
      metalness: isCover ? 0.1 : 0,
    });
    const backMat = new THREE.MeshStandardMaterial({
      map: backTexture,
      roughness: isCover ? 0.6 : 0.8,
      metalness: isCover ? 0.1 : 0,
    });
    const edgeMat = new THREE.MeshStandardMaterial({
      color: isCover ? "#2d1f4e" : "#e8dcc8",
      roughness: 0.9,
    });

    // BoxGeometry face order: +x, -x, +y, -y, +z (front), -z (back)
    return [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat];
  }, [frontTexture, backTexture, isCover]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth lerp to target
    const speed = 4;
    currentAngle.current = THREE.MathUtils.lerp(
      currentAngle.current,
      targetAngle,
      1 - Math.exp(-speed * delta)
    );

    groupRef.current.rotation.y = currentAngle.current;

    // Add slight curve when flipping
    if (meshRef.current) {
      const flipProgress = Math.abs(currentAngle.current) / Math.PI;
      const bendAmount = Math.sin(flipProgress * Math.PI) * 0.15;
      const positions = meshRef.current.geometry.attributes.position;
      const original = geometry.attributes.position;

      for (let i = 0; i < positions.count; i++) {
        const x = original.getX(i);
        const normalizedX = (x + PAGE_WIDTH / 2) / PAGE_WIDTH;
        const bend = Math.sin(normalizedX * Math.PI) * bendAmount;
        positions.setZ(i, original.getZ(i) + bend);
      }
      positions.needsUpdate = true;
    }
  });

  // Stack offset — pages slightly offset to create thickness
  const stackOffset = pageIndex * 0.004;

  return (
    <group
      ref={groupRef}
      position={[-PAGE_WIDTH / 2, 0, -stackOffset]}
      rotation={[0, 0, 0]}
    >
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={materials}
        position={[PAGE_WIDTH / 2, 0, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export default BookPage3D;
