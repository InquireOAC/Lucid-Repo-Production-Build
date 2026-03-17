import React, { useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import BookPage3D from "./BookPage3D";
import { PageTextures } from "./usePageTextures";

interface Book3DSceneProps {
  pageTextures: PageTextures[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Book3DScene = ({
  pageTextures,
  currentPage,
  onPageChange,
}: Book3DSceneProps) => {
  const { size } = useThree();
  const pointerStart = useRef<{ x: number; time: number } | null>(null);

  const handlePointerDown = (e: any) => {
    pointerStart.current = { x: e.clientX ?? e.point?.x ?? 0, time: Date.now() };
  };

  const handlePointerUp = (e: any) => {
    if (!pointerStart.current) return;
    const endX = e.clientX ?? e.point?.x ?? 0;
    const dx = endX - pointerStart.current.x;
    const dt = Date.now() - pointerStart.current.time;
    pointerStart.current = null;

    // Swipe detection
    if (Math.abs(dx) > 30 && dt < 500) {
      if (dx < 0 && currentPage < pageTextures.length - 1) {
        onPageChange(currentPage + 1);
      } else if (dx > 0 && currentPage > 0) {
        onPageChange(currentPage - 1);
      }
    }
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-2, 3, -2]} intensity={0.3} />
      <pointLight position={[0, 2, 3]} intensity={0.3} color="#a882ff" />

      {/* Camera controls — constrained */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
        rotateSpeed={0.3}
      />

      {/* Book group */}
      <group
        position={[0, 0.2, 0]}
        rotation={[-0.15, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* Book spine */}
        <mesh position={[-1.003, 0, 0]} castShadow>
          <boxGeometry args={[0.06, 2.8, 0.12]} />
          <meshStandardMaterial color="#2d1f4e" roughness={0.7} metalness={0.1} />
        </mesh>

        {/* Pages */}
        {pageTextures.map((tex, i) => (
          <BookPage3D
            key={i}
            frontTexture={tex.front}
            backTexture={tex.back}
            pageIndex={i}
            isFlipped={i <= currentPage - 1}
            totalPages={pageTextures.length}
            isCover={i === 0 || i === pageTextures.length - 1}
          />
        ))}
      </group>

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.4}
        scale={8}
        blur={2.5}
        far={4}
      />
    </>
  );
};

export default Book3DScene;
