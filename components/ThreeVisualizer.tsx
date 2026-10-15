import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ThreeVisualizerProps {
  sqm: number;
  style: string;
}

const ThreeVisualizer: React.FC<ThreeVisualizerProps> = ({ sqm, style }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const controlsRef = useRef<any>(null);
  const materialsRef = useRef<{ facade?: THREE.MeshStandardMaterial; roof?: THREE.MeshStandardMaterial }>({});

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#15171C');
    scene.fog = new THREE.Fog('#15171C', 25, 95);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      42,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(22, 18, 28);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 12;
    controls.maxDistance = 65;
    controls.autoRotate = isAutoRotate;
    controls.autoRotateSpeed = 0.6;
    controls.target.set(0, 5, 0);
    controlsRef.current = controls;

    // 5. Procedural Architectural Textures
    const createStuccoTexture = () => {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#8F8B82';
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < 70000; i++) {
          const val = Math.floor(Math.random() * 255);
          ctx.fillStyle = `rgba(${val},${val},${val},0.07)`;
          ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
      return tex;
    };

    const noiseTex = createStuccoTexture();

    // Architectural color styling matching Auralis palette
    let facadeColor = new THREE.Color('#3A342B'); // Warm tinted paper bronze
    let roofColor = new THREE.Color('#1B1D22');   // Deep slate
    let trimColor = new THREE.Color('#B98A45');   // Brass/gold accent

    const styleLower = (style || '').toLowerCase();
    if (styleLower.includes('altbau') || styleLower.includes('wilhelm')) {
      facadeColor.set('#4A3E2D'); // Rich historic stucco
      roofColor.set('#2E2218');   // Historic clay dark
    } else if (styleLower.includes('plattenbau') || styleLower.includes('modern')) {
      facadeColor.set('#2A2D35'); // Deep modern graphite
      roofColor.set('#16181D');
    }

    const facadeMat = new THREE.MeshStandardMaterial({
      color: facadeColor,
      bumpMap: noiseTex,
      bumpScale: 0.015,
      roughness: 0.82,
      metalness: 0.1,
      wireframe: isWireframe,
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: roofColor,
      roughness: 0.7,
      metalness: 0.25,
      wireframe: isWireframe,
    });

    const brassTrimMat = new THREE.MeshStandardMaterial({
      color: trimColor,
      roughness: 0.35,
      metalness: 0.75,
      wireframe: isWireframe,
    });

    // Window Material with warm interior radiance (#FFE8B8)
    const windowMat = new THREE.MeshPhysicalMaterial({
      color: '#FFE8B8',
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.3,
      thickness: 0.4,
      emissive: '#B98A45',
      emissiveIntensity: 0.45,
    });

    materialsRef.current = { facade: facadeMat, roof: roofMat };

    // 6. Architectural Building Geometry
    const buildingGroup = new THREE.Group();
    const footprint = Math.max(7, Math.min(16, Math.sqrt(sqm / 3)));
    const width = footprint;
    const depth = footprint * 0.95;
    const height = 11;

    // Main Facade Body
    const bodyGeo = new THREE.BoxGeometry(width, height, depth);
    const body = new THREE.Mesh(bodyGeo, facadeMat);
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    buildingGroup.add(body);

    // Architectural Cornice / Trim Line
    const corniceGeo = new THREE.BoxGeometry(width + 0.35, 0.4, depth + 0.35);
    const cornice = new THREE.Mesh(corniceGeo, brassTrimMat);
    cornice.position.y = height - 0.2;
    cornice.castShadow = true;
    buildingGroup.add(cornice);

    // Roof Logic
    if (styleLower.includes('modern') || styleLower.includes('plattenbau')) {
      // Flat contemporary roof with solar panels array
      const flatRoofGeo = new THREE.BoxGeometry(width + 0.3, 0.6, depth + 0.3);
      const flatRoof = new THREE.Mesh(flatRoofGeo, roofMat);
      flatRoof.position.y = height + 0.3;
      buildingGroup.add(flatRoof);

      // Solar PV modules on roof
      const pvMat = new THREE.MeshStandardMaterial({ color: '#1E293B', metalness: 0.8, roughness: 0.2 });
      for (let x = -width / 3; x <= width / 3; x += width / 3) {
        for (let z = -depth / 4; z <= depth / 4; z += depth / 3) {
          const pvGeo = new THREE.BoxGeometry(width / 4, 0.15, depth / 4);
          const pv = new THREE.Mesh(pvGeo, pvMat);
          pv.position.set(x, height + 0.7, z);
          pv.rotation.x = 0.2;
          buildingGroup.add(pv);
        }
      }
    } else {
      // Berlin Mansard / Altbau Roof
      const mansardGeo = new THREE.ConeGeometry(width * 0.85, 4.8, 4);
      const roof = new THREE.Mesh(mansardGeo, roofMat);
      roof.position.y = height + 2.4;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      buildingGroup.add(roof);

      // Roof dormer decorative elements
      const dormerGeo = new THREE.BoxGeometry(1.2, 1.2, 0.6);
      const dormer1 = new THREE.Mesh(dormerGeo, brassTrimMat);
      dormer1.position.set(0, height + 1.2, depth / 2 + 0.2);
      buildingGroup.add(dormer1);
    }

    // Windows with architectural framing
    const addWindows = (rotationY: number, zPos: number) => {
      const rows = 4;
      const cols = 3;
      const wW = width / 5;
      const wH = height / 6.5;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const win = new THREE.Mesh(new THREE.PlaneGeometry(wW, wH), windowMat);
          win.rotation.y = rotationY;
          const xBase = (c - 1) * (width / 3.4);
          const yBase = r * (height / rows) + 1.4;
          if (yBase < height - 1) {
            win.position.set(xBase, yBase, zPos);
            buildingGroup.add(win);

            // Subtle gold lintel above each window
            const lintelGeo = new THREE.BoxGeometry(wW + 0.15, 0.1, 0.1);
            const lintel = new THREE.Mesh(lintelGeo, brassTrimMat);
            lintel.rotation.y = rotationY;
            lintel.position.set(xBase, yBase + wH / 2 + 0.08, zPos + (rotationY === 0 ? 0.05 : -0.05));
            buildingGroup.add(lintel);
          }
        }
      }
    };

    addWindows(0, depth / 2 + 0.02);
    addWindows(Math.PI, -depth / 2 - 0.02);

    scene.add(buildingGroup);

    // 7. Ground Grid & Base Plinth
    const groundGeo = new THREE.CircleGeometry(32, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#121418',
      roughness: 0.95,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Architectural Radial Hairline Ring
    const ringGeo = new THREE.RingGeometry(18, 18.08, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: '#B98A45', transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);

    // 8. Lighting System
    const ambientLight = new THREE.AmbientLight('#FFE8B8', 0.5);
    scene.add(ambientLight);

    // Key Light (Golden Hour Warmth)
    const keyLight = new THREE.DirectionalLight('#FFE8B8', 1.8);
    keyLight.position.set(24, 32, 22);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Subtle Cool Fill Light for Architectural Contrast
    const fillLight = new THREE.DirectionalLight('#60A5FA', 0.6);
    fillLight.position.set(-20, 15, -20);
    scene.add(fillLight);

    // 9. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      const time = Date.now() * 0.001;
      // Soft breathing glow in windows
      windowMat.emissiveIntensity = 0.4 + Math.sin(time * 1.8) * 0.12;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      noiseTex.dispose();
      facadeMat.dispose();
      roofMat.dispose();
      brassTrimMat.dispose();
      windowMat.dispose();
      groundMat.dispose();
      ringMat.dispose();
      controls.dispose();
    };
  }, [sqm, style]);

  const toggleAutoRotate = () => {
    setIsAutoRotate(prev => {
      const next = !prev;
      if (controlsRef.current) {
        controlsRef.current.autoRotate = next;
      }
      return next;
    });
  };

  const toggleWireframe = () => {
    setIsWireframe(prev => {
      const next = !prev;
      if (materialsRef.current.facade) materialsRef.current.facade.wireframe = next;
      if (materialsRef.current.roof) materialsRef.current.roof.wireframe = next;
      return next;
    });
  };

  return (
    <div className="w-full h-full min-h-[340px] relative rounded-[8px] overflow-hidden border border-border bg-[#15171C]">
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />
      
      {/* Top HUD Tag */}
      <div className="absolute top-3 left-3 bg-[#1A1C22]/90 backdrop-blur-md px-3 py-1.5 rounded-[6px] border border-[#322A1F] z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-mono font-medium text-[#FFE8B8] tracking-wide uppercase">
          3D Digital Twin · {style || 'Berlin Multifamily'}
        </span>
      </div>

      {/* Interactive Controls Overlay */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-[#1A1C22]/90 backdrop-blur-md p-1 rounded-[6px] border border-[#322A1F]">
        <button
          onClick={toggleAutoRotate}
          title={isAutoRotate ? "Pause Orbit" : "Play Orbit"}
          className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
            isAutoRotate ? 'bg-[#322A1F] text-primary' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <i className={`fas ${isAutoRotate ? 'fa-pause' : 'fa-play'} text-[10px] mr-1`}></i>
          Orbit
        </button>
        <button
          onClick={toggleWireframe}
          title="Toggle Technical Wireframe"
          className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
            isWireframe ? 'bg-primary text-black font-semibold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <i className="fas fa-cube text-[10px] mr-1"></i>
          Wireframe
        </button>
      </div>

      {/* Orbit Tip Footer */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-zinc-500 pointer-events-none select-none px-1">
        <span>Scale: {sqm} m² GFA</span>
        <span>Drag to rotate · Scroll to zoom</span>
      </div>
    </div>
  );
};

export default ThreeVisualizer;