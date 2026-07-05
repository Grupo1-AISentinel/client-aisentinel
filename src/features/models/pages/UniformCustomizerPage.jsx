import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as THREE from 'three';

const UNIFORMES_DATA = [
  {
    id: "uniforme-1",
    anio: "2019",
    nombre: "Promoción 26",
    descripcion: "Esta prenda conmemorativa, correspondiente al año 2019, fue portada con orgullo por los integrantes de la vigésimo sexta promoción de Fundación Kinal, representando su esfuerzo, identidad y el inicio de su legado institucional.",
    tipo: "Oficial",
    modeloPath: "../../../../public/three/Uniforme1.glb"
  },
  {
    id: "uniforme-2",
    anio: "2023",
    nombre: "Promoción 30",
    descripcion: "Esta prenda conmemorativa, correspondiente al año 2023, fue portada con orgullo por los integrantes de la trigésima promoción de Fundación Kinal, representando su esfuerzo, identidad y el inicio de su legado institucional.",
    tipo: "Uso Diario",
    modeloPath: "../../../../public/three/Uniforme2.glb"
  },
  {
    id: "uniforme-3",
    anio: "2024",
    nombre: "Promoción 31",
    descripcion: "Esta prenda conmemorativa, correspondiente al año 2024, fue portada con orgullo por los integrantes de la trigésimo primera promoción de Fundación Kinal, representando su esfuerzo, identidad y el inicio de su legado institucional.",
    tipo: "Uso Diario",
    modeloPath: "../../../../public/three/Uniforme3.glb"
  },
  {
    id: "uniforme-4",
    anio: "2017",
    nombre: "Promoción 25",
    descripcion: "Esta prenda conmemorativa, correspondiente al año 2017, fue portada con orgullo por los integrantes de la vigésimo quinta promoción de Fundación Kinal, representando su esfuerzo, identidad y el inicio de su legado institucional.",
    tipo: "Uso Diario",
    modeloPath: "../../../../public/three/Uniforme4.glb"
  },
  {
    id: "uniforme-5",
    anio: "2025",
    nombre: "Promoción 32",
    descripcion: "Esta prenda conmemorativa, correspondiente al año 2025, fue portada con orgullo por los integrantes de la trigésimo segunda promoción de Fundación Kinal, representando su esfuerzo, identidad y el inicio de su legado institucional.",
    tipo: "Uso Diario",
    modeloPath: "../../../../public/three/Uniforme5.glb"
  },
  {
    id: "uniforme-6",
    anio: "2026",
    nombre: "Promoción 33",
    descripcion: "Esta prenda conmemorativa, correspondiente al año 2026, fue portada con orgullo por los integrantes de la trigésimo tercera promoción de Fundación Kinal, representando su esfuerzo, identidad y el inicio de su legado institucional.",
    tipo: "Uso Diario",
    modeloPath: "../../../../public/three/Uniforme6.glb"
  },
  {
    id: "uniforme-7",
    anio: "2023",
    nombre: "Chumpa de Diario Clásica",
    descripcion: "Esta prenda institucional, correspondiente al uniforme de diario de Fundación Kinal, es portada con orgullo por los alumnos de tercer año de educación básica hasta sexto año de diversificado, representando los valores, la identidad y la excelencia académica que caracterizan a nuestra comunidad educativa en su día a día.",
    tipo: "Uso Diario",
    modeloPath: "../../../../public/three/Uniforme7.glb"
  }
];

const BASE_HEIGHT = 0.11;
const BASE_RADIUS = 0.95;
const PLATFORM_RADIUS = 0.82;

const VELOCIDAD_ROTACION = 0.6;

const RotatingModel = ({ modeloPath, onReady }) => {
  const [scene, setScene] = useState(null);
  const groupRef = useRef();

  useEffect(() => {
    let active = true;
    const loader = new GLTFLoader();

    loader.load(
      modeloPath,
      (gltf) => {
        if (!active) return;

        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);

        model.position.x = -center.x;
        model.position.y = BASE_HEIGHT - box.min.y;
        model.position.z = -center.z;

        model.traverse((obj) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
            if (obj.material) obj.material.envMapIntensity = 0.8;
          }
        });

        setScene(model);
        onReady?.();
      },
      undefined,
      (err) => console.error('[Models 3D] Error cargando el archivo .glb:', err)
    );

    return () => {
      active = false;
      setScene(null);
    };
  }, [modeloPath]);

  // 🚀 Aquí se aplica la nueva velocidad de rotación constante
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * VELOCIDAD_ROTACION;
    }
  });

  if (!scene) return null;
  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
};

// 3. PEDESTAL CON EL AÑO FLOTANTE
const Pedestal = ({ anio }) => (
  <group>
    {/* El año se proyecta tridimensionalmente al frente del pedestal */}
    <Html
      position={[0, 0.052, BASE_RADIUS * 1.02]}
      center
      transform
      distanceFactor={2.5}
    >
      <div className="bg-slate-950/95 text-yellow-400 border border-yellow-500/30 px-3 py-0.5 rounded-md font-black text-sm tracking-widest shadow-lg uppercase select-none backdrop-blur-xs">
        {anio}
      </div>
    </Html>

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

// 4. COMPONENTE PRINCIPAL INTERACTIVO
export const UniformCustomizerPage = () => {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const actual = UNIFORMES_DATA[index];

  const siguiente = () => {
    setLoading(true);
    setIndex((prev) => (prev + 1) % UNIFORMES_DATA.length);
  };

  const anterior = () => {
    setLoading(true);
    setIndex((prev) => (prev - 1 + UNIFORMES_DATA.length) % UNIFORMES_DATA.length);
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      siguiente();
    }, 11000);

    return () => clearInterval(intervalo);
  }, [index]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-0 bg-[#050b14] overflow-hidden flex">

      {/* CAPA DE CAPAS DE INTERFAZ HTML (SUPERIOR Z-INDEX) */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-10">

        {/* 🚀 PANEL INFORMATIVO CORREGIDO (Bajado con top-28 y mt-2 para librar la barra superior) */}
        <div className="absolute top-28 right-10 w-85 p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-yellow-500/20 shadow-2xl pointer-events-auto transition-all duration-500">
          <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Edición Histórica</span>
          <h2 className="text-4xl font-black mt-1 text-yellow-400">{actual.anio}</h2>
          <h3 className="text-lg font-bold mt-2 text-white">{actual.nombre}</h3>
          <p className="text-sm text-gray-300 mt-3 leading-relaxed">{actual.descripcion}</p>

          <div className="mt-5 pt-4 border-t border-gray-800/60 flex justify-between text-xs">
            <div>
              <span className="text-gray-500 block mb-0.5">Tipo:</span>
              <span className="text-gray-200 font-medium">{actual.tipo}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-0.5">Detalles:</span>
              <span className="text-gray-200 font-medium">{actual.detalles}</span>
            </div>
          </div>
        </div>

        {/* CONTROLES DEL CARRUSEL (Se mantienen abajo al centro) */}
        <div className="mt-auto self-center flex items-center gap-6 bg-slate-900/70 px-6 py-3 rounded-full border border-yellow-500/20 backdrop-blur-sm shadow-xl pointer-events-auto">
          <button onClick={anterior} className="text-gray-400 hover:text-yellow-400 transition-colors text-xl font-bold p-1 select-none">
            &larr;
          </button>
          <span className="text-sm font-semibold tracking-widest text-yellow-500 select-none">
            {index + 1} / {UNIFORMES_DATA.length}
          </span>
          <button onClick={siguiente} className="text-gray-400 hover:text-yellow-400 transition-colors text-xl font-bold p-1 select-none">
            &rarr;
          </button>
        </div>
      </div>

      {/* LIENZO 3D CANVAS */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
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
          <Pedestal anio={actual.anio} />

          {/* Renderizado dinámico usando el cargador GLB */}
          <RotatingModel modeloPath={actual.modeloPath} onReady={() => setLoading(false)} />

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

      {/* COMPONENTE VISUAL DE CARGA */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-[#050b14]/40 backdrop-blur-xs pointer-events-none">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-xs text-gray-300">Cargando modelo histórico...</span>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default UniformCustomizerPage;