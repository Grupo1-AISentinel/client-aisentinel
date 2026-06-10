import { Component, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import useModels3DStore from '../stores/models3dStore.js';
import { SLOT_TRANSFORMS } from '../utils/skeletonBinding.js';
import { loadAdjustments } from '../utils/garmentAdjustments.js';

// Hook personalizado: carga un GLB sin suspender. Maneja cache manualmente.
const useGLB = (path) => {
  const [scene, setScene] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setScene(null);

    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        if (cancelled) return;
        setScene(gltf.scene);
        setLoading(false);
      },
      undefined,
      (err) => {
        if (cancelled) return;
        console.error('[useGLB] Error loading', path, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [path]);

  return { scene, error, loading };
};

const StaticModel = ({ garment, role, onBindResult }) => {
  const { scene, error, loading } = useGLB(garment.path);
  const garmentId = garment?.id;

  useEffect(() => {
    if (error) {
      onBindResult?.(garmentId, { success: false, mode: 'failed', mismatches: [String(error)] });
    } else if (scene) {
      onBindResult?.(garmentId, { success: true, mode: 'static', mismatches: [] });
    }
  }, [scene, error, garmentId, onBindResult]);

  const userAdj = useMemo(() => loadAdjustments(garmentId), [garmentId]);
  const slotBase = SLOT_TRANSFORMS[role] || SLOT_TRANSFORMS.upper;
  const transform = useMemo(() => {
    if (!userAdj) return slotBase;
    return {
      position: [
        slotBase.position[0] + userAdj.position[0],
        slotBase.position[1] + userAdj.position[1],
        slotBase.position[2] + userAdj.position[2],
      ],
      rotation: [
        slotBase.rotation[0] + userAdj.rotation[0],
        slotBase.rotation[1] + userAdj.rotation[1],
        slotBase.rotation[2] + userAdj.rotation[2],
      ],
      scale: slotBase.scale * userAdj.scale,
    };
  }, [userAdj, slotBase]);

  if (!scene) return null;
  return (
    <group position={transform.position} rotation={transform.rotation} scale={transform.scale}>
      <primitive object={scene} />
    </group>
  );
};

const SlowAutoRotate = ({ enabled, targetRef }) => {
  useFrame((_, delta) => {
    if (targetRef?.current && enabled) targetRef.current.rotation.y += delta * 0.25;
  });
  return null;
};

const SceneContents = ({ body, sceneGarments, onBindResult }) => (
  <group>
    {body && <StaticModel garment={body} role="body" onBindResult={onBindResult} />}
    {sceneGarments
      .filter((g) => g.role !== 'body')
      .map((g) => (
        <StaticModel key={g.id} garment={g} role={g.role} onBindResult={onBindResult} />
      ))}
  </group>
);

const UniformViewer = ({ autoRotate = false, onBindIssuesChange }) => {
  const [resetKey, setResetKey] = useState(0);
  const sceneGroupRef = useRef();
  const issuesRef = useRef(new Set());

  const sceneGarments = useModels3DStore((s) => s.sceneGarments);
  const body = useModels3DStore((s) => s.bodyGarment);

  const handleBindResult = useCallback(
    (garmentId, result) => {
      if (!garmentId || !onBindIssuesChange) return;
      const key = `${garmentId}:${result.mode}:${result.success}`;
      if (issuesRef.current.has(key)) return;
      issuesRef.current.add(key);
      onBindIssuesChange([{ id: garmentId, ...result }]);
    },
    [onBindIssuesChange]
  );

  const handleRetry = useCallback(() => {
    issuesRef.current = new Set();
    setResetKey((k) => k + 1);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-surface-container-lowest to-[#0a0e14] rounded-2xl overflow-hidden">
      <Canvas
        key={resetKey}
        shadows={false}
        dpr={[1, 1]}
        camera={{ position: [0, 0.95, 3.0], fov: 38 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a0e14', 1);
        }}
      >
        <color attach="background" args={['#0a0e14']} />

        <SceneContents body={body} sceneGarments={sceneGarments} onBindResult={handleBindResult} />

        {autoRotate && <SlowAutoRotate enabled={autoRotate} targetRef={sceneGroupRef} />}
        <OrbitControls
          enablePan={false}
          enableDamping={false}
          minDistance={1.6}
          maxDistance={6}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 1.9}
          target={[0, 0.9, 0]}
          makeDefault
        />

        <ambientLight intensity={0.85} />
        <directionalLight position={[4, 7, 4]} intensity={1.6} />
        <directionalLight position={[-3, 3, -2]} intensity={0.4} color="#8ab4ff" />
      </Canvas>
    </div>
  );
};

export default UniformViewer;
