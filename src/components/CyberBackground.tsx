'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function CyberBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.0008);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.z = 500;
    camera.position.y = 100;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(2000, 50, 0x00f5ff, 0x1a1a2e);
    gridHelper.position.y = -200;
    scene.add(gridHelper);

    // Particle System - Matrix Rain
    const particleCount = 5000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount);

    const colorCyan = new THREE.Color(0x00f5ff);
    const colorMagenta = new THREE.Color(0xff00ff);
    const colorGreen = new THREE.Color(0x00ff41);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

      const colorChoice = Math.random();
      let color;
      if (colorChoice < 0.5) {
        color = colorCyan;
      } else if (colorChoice < 0.8) {
        color = colorMagenta;
      } else {
        color = colorGreen;
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 1;
      velocities[i] = Math.random() * 2 + 1;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Wireframe Icosahedron
    const icoGeometry = new THREE.IcosahedronGeometry(80, 1);
    const icoMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
    icosahedron.position.set(300, 100, -200);
    scene.add(icosahedron);

    // Wireframe Torus
    const torusGeometry = new THREE.TorusGeometry(60, 20, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-300, 50, -300);
    scene.add(torus);

    // Wireframe Octahedron
    const octaGeometry = new THREE.OctahedronGeometry(50, 0);
    const octaMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff41,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const octahedron = new THREE.Mesh(octaGeometry, octaMaterial);
    octahedron.position.set(0, 200, -400);
    scene.add(octahedron);

    // Data Lines
    const lineCount = 30;
    const lines: THREE.Line[] = [];

    for (let i = 0; i < lineCount; i++) {
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array(6);

      const startX = (Math.random() - 0.5) * 1500;
      const startY = (Math.random() - 0.5) * 800 + 200;
      const startZ = (Math.random() - 0.5) * 500 - 500;

      linePositions[0] = startX;
      linePositions[1] = startY;
      linePositions[2] = startZ;
      linePositions[3] = startX + (Math.random() - 0.5) * 200;
      linePositions[4] = startY + (Math.random() - 0.5) * 100;
      linePositions[5] = startZ - Math.random() * 200;

      lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

      const lineMaterial = new THREE.LineBasicMaterial({
        color: Math.random() > 0.5 ? 0x00f5ff : 0xff00ff,
        transparent: true,
        opacity: Math.random() * 0.5 + 0.2,
      });

      const line = new THREE.Line(lineGeometry, lineMaterial);
      lines.push(line);
      scene.add(line);
    }

    // Mouse movement
    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX) * 0.05;
      mouseY = (event.clientY - windowHalfY) * 0.05;
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Animation
    let time = 0;
    const animate = () => {
      time += 0.01;
      animationRef.current = requestAnimationFrame(animate);

      // Rotate camera based on mouse
      camera.position.x += (mouseX - camera.position.x) * 0.02;
      camera.position.y += (-mouseY + 100 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      // Animate particles (Matrix rain effect)
      const positionsArray = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positionsArray[i * 3 + 1] -= velocities[i];
        if (positionsArray[i * 3 + 1] < -1000) {
          positionsArray[i * 3 + 1] = 1000;
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Rotate shapes
      icosahedron.rotation.x += 0.005;
      icosahedron.rotation.y += 0.01;

      torus.rotation.x += 0.01;
      torus.rotation.z += 0.005;

      octahedron.rotation.y += 0.015;
      octahedron.rotation.z += 0.01;

      // Pulse icosahedron
      const scale = 1 + Math.sin(time * 2) * 0.1;
      icosahedron.scale.set(scale, scale, scale);

      // Animate grid
      gridHelper.position.z = (time * 50) % 40 - 20;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
