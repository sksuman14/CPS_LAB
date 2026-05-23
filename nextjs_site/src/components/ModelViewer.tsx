'use client';

import React, { Suspense, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  useGLTF,
  OrbitControls,
  Bounds,
  Center,
  ContactShadows,
  Environment,
  useAnimations,
  Float,
  AdaptiveDpr,
  AdaptiveEvents
} from '@react-three/drei';
import * as THREE from 'three';

// Stable CDN for Draco decoder logic
const DRACO_URL = 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/';

function Model({ url }: { url: string }) {
  // Use Draco for significantly faster mesh decompression
  const { scene, animations } = useGLTF(url, DRACO_URL);
  const { actions, names } = useAnimations(animations, scene);

  useEffect(() => {
    if (names.length > 0) {
      // Auto-play primary animation if detected in the GLB
      const action = actions[names[0]];
      if (action) action.reset().fadeIn(0.5).play();
    }
  }, [actions, names]);

  return <primitive object={scene} castShadow receiveShadow />;
}

export default function ModelViewer({
  modelPath,
  className = "",
  scale = 1,
  autoRotate = true
}: {
  modelPath: string;
  className?: string;
  scale?: number;
  autoRotate?: boolean;
}) {
  const formattedPath = useMemo(() => {
    if (modelPath.startsWith('http://') || modelPath.startsWith('https://')) {
      return modelPath;
    }
    return modelPath.startsWith('/') ? modelPath : `/${modelPath}`;
  }, [modelPath]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-3xl animate-pulse z-10">
          <div className="flex flex-col items-center gap-3 text-white/40">
            <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
            <span className="text-[10px] uppercase font-bold tracking-widest">Warming Engine</span>
          </div>
        </div>
      }>
        <Canvas
          shadows
          dpr={[1, 1.5]} // Adaptive resolution for high-performance rendering
          camera={{ position: [0, 0, 5], fov: 40 }}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            alpha: true,
            stencil: false,
            depth: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          className="w-full h-full"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />

          <ambientLight intensity={0.4} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
          <pointLight position={[-10, -5, -10]} intensity={0.5} color="#4c1d95" />
          <directionalLight position={[0, 5, 5]} intensity={1.2} />

          <Environment preset="city" />

          <Bounds fit clip observe margin={1.2}>
            <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
              <Center top>
                <Model url={formattedPath} />
              </Center>
            </Float>
          </Bounds>

          <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2.2} far={4} />

          <OrbitControls
            makeDefault
            autoRotate={autoRotate}
            autoRotateSpeed={6.5} // Faster, more cinematic auto-rotation
            rotateSpeed={2.4} // Highly responsive manual interaction
            enableDamping={true}
            dampingFactor={0.06}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

// Global preload helper
ModelViewer.preload = (url: string) => {
  const formattedUrl = (url.startsWith('http://') || url.startsWith('https://')) 
    ? url 
    : (url.startsWith('/') ? url : `/${url}`);
  useGLTF.preload(formattedUrl, DRACO_URL);
};