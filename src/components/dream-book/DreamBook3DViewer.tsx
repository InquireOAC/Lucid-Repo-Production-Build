import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { DreamEntry } from "@/types/dream";
import Book3DScene from "./Book3DScene";
import { usePageTextures } from "./usePageTextures";
import { Loader2 } from "lucide-react";

interface DreamBook3DViewerProps {
  dreams: DreamEntry[];
  authorName: string;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const DreamBook3DViewerInner = ({
  dreams,
  authorName,
  currentPage,
  onPageChange,
}: DreamBook3DViewerProps) => {
  const pageTextures = usePageTextures(dreams, authorName);

  if (pageTextures.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full" style={{ minHeight: 400 }}>
      <Canvas
        shadows
        camera={{ position: [0, 2, 5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Book3DScene
            pageTextures={pageTextures}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

const DreamBook3DViewer = (props: DreamBook3DViewerProps) => {
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) setWebGLSupported(false);
    } catch {
      setWebGLSupported(false);
    }
  }, []);

  if (!webGLSupported) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 text-center">
        <p className="text-muted-foreground text-sm">
          3D view requires WebGL. Please use Reader mode instead.
        </p>
      </div>
    );
  }

  return <DreamBook3DViewerInner {...props} />;
};

export default DreamBook3DViewer;
