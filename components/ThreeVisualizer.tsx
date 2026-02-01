import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ThreeVisualizerProps {
  sqm: number;
  style: string;
}

const ThreeVisualizer: React.FC<ThreeVisualizerProps> = ({ sqm, style }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    
    // Check dark mode for background color
    const isDark = document.documentElement.classList.contains('dark');
    scene.background = new THREE.Color(isDark ? '#1e293b' : '#f1f5f9');
    scene.fog = new THREE.Fog(scene.background, 10, 80);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(20, 20, 30);
    
    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 60;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.target.set(0, 5, 0);

    // 5. Materials Setup
    
    // Generator: Noise Texture (Stucco/Concrete)
    const createNoiseTexture = () => {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < 100000; i++) {
          const val = Math.floor(Math.random() * 255);
          ctx.fillStyle = `rgba(${val},${val},${val},0.1)`;
          ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      return tex;
    };

    // Generator: Roof Texture (Tiles/Lines)
    const createRoofTexture = () => {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            // Draw lines for tiles
            for (let i=0; i<size; i+=32) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(size, i);
                ctx.stroke();
            }
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 4);
        return tex;
    };

    const noiseTex = createNoiseTexture();
    const roofTex = createRoofTexture();

    // Determine Base Colors
    let facadeColor = new THREE.Color('#e2e8f0');
    let roofColor = new THREE.Color('#334155');
    
    const styleLower = style.toLowerCase();
    if (styleLower.includes('altbau')) {
        facadeColor.set('#fcd34d'); // Warm
        roofColor.set('#7c2d12');   // Clay
    } else if (styleLower.includes('plattenbau')) {
        facadeColor.set('#cbd5e1'); // Concrete
        roofColor.set('#475569');   // Dark
    } else if (styleLower.includes('modern')) {
        facadeColor.set('#f8fafc'); // White
        roofColor.set('#0f172a');   // Black
    }

    // Facade Material
    const facadeMat = new THREE.MeshStandardMaterial({ 
      color: facadeColor,
      map: noiseTex,      // Color variation
      bumpMap: noiseTex,  // Texture depth
      bumpScale: 0.02,
      roughness: 0.9,
      emissive: facadeColor, // For glow effect
      emissiveIntensity: 0.0,
    });

    // Roof Material
    const roofMat = new THREE.MeshStandardMaterial({ 
      color: roofColor, 
      map: roofTex,
      bumpMap: roofTex,
      bumpScale: 0.05,
      roughness: 0.8,
    });

    // Window Material
    const windowMat = new THREE.MeshPhysicalMaterial({ 
      color: '#a5f3fc',
      metalness: 0.9,
      roughness: 0.05,
      transmission: 0.1,
      thickness: 0.5,
      emissive: '#0ea5e9',
      emissiveIntensity: 0.2
    });

    // 6. Geometry
    const buildingGroup = new THREE.Group();
    const footprintSize = Math.sqrt(sqm / 3); 
    const width = footprintSize;
    const depth = footprintSize;
    const height = 12; 

    // Body
    const bodyGeo = new THREE.BoxGeometry(width, height, depth);
    const body = new THREE.Mesh(bodyGeo, facadeMat);
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    buildingGroup.add(body);

    // Roof Logic
    let roof;
    if (styleLower.includes('modern') || styleLower.includes('plattenbau')) {
        const roofGeo = new THREE.BoxGeometry(width + 0.5, 0.5, depth + 0.5);
        roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = height + 0.25;
    } else {
        const roofGeo = new THREE.ConeGeometry(width * 0.8, 5, 4);
        roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = height + 2.5;
        roof.rotation.y = Math.PI / 4;
        
        // Adjust texture for cone
        roofTex.repeat.set(2, 1); 
    }
    roof.castShadow = true;
    buildingGroup.add(roof);

    // Windows
    const addWindowsToFace = (rotationY: number, zPos: number) => {
        const rows = 3;
        const cols = 3;
        const wW = width / 5;
        const wH = height / 5;
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                const win = new THREE.Mesh(new THREE.PlaneGeometry(wW, wH), windowMat);
                win.rotation.y = rotationY;
                const xBase = (c - 1) * (width / 3);
                const yBase = (r * (height / rows)) + (height/rows)/2 + 1;
                if (yBase < height) {
                    win.position.set(xBase, yBase, zPos);
                    buildingGroup.add(win);
                }
            }
        }
    };
    addWindowsToFace(0, depth/2 + 0.01);
    addWindowsToFace(Math.PI, -depth/2 - 0.01);

    scene.add(buildingGroup);

    // Ground
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 1 }) 
    );
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(20, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048; // Higher res shadows
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      const time = Date.now() * 0.001;

      // Subtle "breathing" light effect on facade (AI feel)
      // Modulate emissive intensity with a slow sine wave
      const flicker = (Math.sin(time * 2) + 1) * 0.05; // 0.0 to 0.1
      facadeMat.emissiveIntensity = flicker;

      // Window reflection flicker
      windowMat.emissiveIntensity = 0.2 + (Math.sin(time * 3) * 0.05);

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup and Resize
    const handleResize = () => {
        if (!mountRef.current) return;
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      noiseTex.dispose();
      roofTex.dispose();
      facadeMat.dispose();
      roofMat.dispose();
      windowMat.dispose();
      controls.dispose();
    };
  }, [sqm, style]);

  return (
    <div className="w-full h-full min-h-[300px] relative rounded-lg overflow-hidden border border-border shadow-inner bg-card">
      <div ref={mountRef} className="w-full h-full absolute inset-0" />
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur px-3 py-1 rounded shadow text-xs font-semibold text-muted-foreground border border-border z-10 pointer-events-none">
        Interactive 3D • {style}
      </div>
      <div className="absolute bottom-4 right-4 text-[10px] text-muted-foreground/70 pointer-events-none select-none bg-background/50 px-2 py-1 rounded backdrop-blur-sm z-10">
        <i className="fas fa-mouse mr-1"></i> Orbit & Zoom
      </div>
    </div>
  );
};

export default ThreeVisualizer;