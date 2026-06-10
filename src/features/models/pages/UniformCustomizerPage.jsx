import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as THREE from 'three';

const HUMAN_MODEL_PATH = '/three/human.fbx';
const BASE_HEIGHT = 0.11;
const BASE_RADIUS = 0.95;
const PLATFORM_RADIUS = 0.82;

const RotatingHuman = ({ onReady }) => {
  const [scene, setScene] = useState(null);
  const groupRef = useRef();

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(
      HUMAN_MODEL_PATH,
      (fbx) => {
        const box = new THREE.Box3().setFromObject(fbx);
        const center = new THREE.Vector3();
        box.getCenter(center);
        fbx.position.x = -center.x;
        fbx.position.y = BASE_HEIGHT - box.min.y;
        fbx.position.z = -center.z;
        fbx.traverse((obj) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
            if (obj.material) obj.material.envMapIntensity = 0.7;
          }
        });
        setScene(fbx);
        onReady?.(fbx);
      },
      undefined,
      (err) => console.error('[Models] Error cargando human.fbx', err)
    );
  }, [onReady]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  if (!scene) return null;
  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
};

const Pedestal = () => (
  <group>
    <mesh position={[0, 0.011, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[BASE_RADIUS, BASE_RADIUS * 1.03, 0.022, 96]} />
      <meshStandardMaterial color="#141a28" metalness={0.75} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.028, 0]} receiveShadow>
      <cylinderGeometry args={[BASE_RADIUS * 0.97, BASE_RADIUS, 0.012, 96]} />
      <meshStandardMaterial color="#1a2233" metalness={0.8} roughness={0.28} />
    </mesh>
    <mesh position={[0, 0.052, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[BASE_RADIUS * 0.95, BASE_RADIUS * 0.97, 0.048, 96]} />
      <meshStandardMaterial color="#1c2438" metalness={0.82} roughness={0.25} />
    </mesh>
    <mesh position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[BASE_RADIUS * 0.95 - 0.006, BASE_RADIUS * 0.95, 96]} />
      <meshStandardMaterial color="#3a4358" metalness={0.95} roughness={0.18} />
    </mesh>
    <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[BASE_RADIUS * 0.95 - 0.003, BASE_RADIUS * 0.95 - 0.001, 96]} />
      <meshStandardMaterial color="#2a3346" metalness={0.9} roughness={0.22} />
    </mesh>
    <mesh position={[0, 0.086, 0]} receiveShadow>
      <cylinderGeometry args={[PLATFORM_RADIUS + 0.015, BASE_RADIUS * 0.95, 0.016, 96]} />
      <meshStandardMaterial color="#1e2638" metalness={0.75} roughness={0.3} />
    </mesh>
    <mesh position={[0, BASE_HEIGHT - 0.006, 0]} receiveShadow>
      <cylinderGeometry args={[PLATFORM_RADIUS, PLATFORM_RADIUS, 0.012, 96]} />
      <meshStandardMaterial color="#222a3c" metalness={0.55} roughness={0.4} />
    </mesh>
    <mesh position={[0, BASE_HEIGHT + 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[PLATFORM_RADIUS - 0.012, PLATFORM_RADIUS, 96]} />
      <meshStandardMaterial color="#4d5768" metalness={0.95} roughness={0.15} />
    </mesh>
    <mesh position={[0, BASE_HEIGHT + 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[PLATFORM_RADIUS - 0.007, PLATFORM_RADIUS - 0.004, 96]} />
      <meshBasicMaterial color="#fbbf24" toneMapped={false} transparent opacity={0.55} />
    </mesh>
    <mesh position={[0, BASE_HEIGHT + 0.0025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.035, 0.048, 32]} />
      <meshBasicMaterial color="#fbbf24" toneMapped={false} transparent opacity={0.6} />
    </mesh>
  </group>
);

const ShadowCatcher = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
    <planeGeometry args={[20, 20]} />
    <shadowMaterial transparent opacity={0.45} />
  </mesh>
);

const StudioEnvironment = () => {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      env.dispose();
      pmrem.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
};

const SceneCamera = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 1.45, 4.7);
    camera.lookAt(0, BASE_HEIGHT + 0.9, 0);
  }, [camera]);
  return null;
};

const UniformCustomizerPage = () => {
  const [loading, setLoading] = useState(true);
  const handleReady = () => setLoading(false);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 pointer-events-auto">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
          camera={{ position: [0, 1.45, 4.7], fov: 32 }}
        >
          <SceneCamera />
          <StudioEnvironment />

          <hemisphereLight args={['#dbe4f2', '#0f1320', 0.5]} />
          <ambientLight intensity={0.25} />

          <directionalLight
            position={[-3, 5, 3]}
            intensity={1.0}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-radius={10}
            shadow-bias={-0.0004}
            shadow-normalBias={0.02}
            shadow-camera-left={-3}
            shadow-camera-right={3}
            shadow-camera-top={4}
            shadow-camera-bottom={-1}
          />
          <directionalLight position={[4, 3, 2.5]} intensity={0.5} color="#dde4f0" />
          <directionalLight position={[0, 2.5, -3.5]} intensity={0.45} color="#ffe8c4" />

          <ShadowCatcher />
          <Pedestal />
          <RotatingHuman onReady={handleReady} />

          <OrbitControls
            target={[0, BASE_HEIGHT + 0.9, 0]}
            enablePan={false}
            enableZoom
            minDistance={2.8}
            maxDistance={7}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.8}
            enableDamping
            dampingFactor={0.08}
            makeDefault
          />
        </Canvas>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-surface-container-high/80 backdrop-blur-sm border border-white/10">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            <span className="font-label text-xs text-on-surface-variant">Cargando modelo...</span>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default UniformCustomizerPage;
