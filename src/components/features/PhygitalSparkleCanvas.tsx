"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface PhygitalSparkleCanvasProps {
  mouseX: number; // Normalized -0.5 to 0.5
  mouseY: number; // Normalized -0.5 to 0.5
  isHovered: boolean;
  burstTrigger?: number; // Increment to trigger particle burst
}

export default function PhygitalSparkleCanvas({
  mouseX,
  mouseY,
  burstTrigger = 0,
}: PhygitalSparkleCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const burstActionRef = useRef<(() => void) | null>(null);

  // Trigger burst when prop changes
  useEffect(() => {
    if (burstTrigger > 0 && burstActionRef.current) {
      burstActionRef.current();
    }
  }, [burstTrigger]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 550;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 280;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particles: Floating Gold & Rose Gold Dust
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const originalPos = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    const goldColor = new THREE.Color("#ffd700");
    const roseColor = new THREE.Color("#fea095");
    const whiteColor = new THREE.Color("#ffffff");
    const rubyColor = new THREE.Color("#c13d28");

    for (let i = 0; i < particleCount; i++) {
      const radius = 90 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;

      positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(phi) * 1.1;
      positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      originalPos[i * 3] = positions[i * 3];
      originalPos[i * 3 + 1] = positions[i * 3 + 1];
      originalPos[i * 3 + 2] = positions[i * 3 + 2];

      velocities[i * 3] = (Math.random() - 0.5) * 0.4;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      // Color distribution
      const rand = Math.random();
      const c = rand < 0.5 ? goldColor : rand < 0.8 ? roseColor : rand < 0.95 ? rubyColor : whiteColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Custom circular soft glow particle texture
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.2, "rgba(255, 215, 0, 0.9)");
      grad.addColorStop(0.6, "rgba(254, 160, 149, 0.4)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(32, 32, 32, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 7,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 3D Ring Orbit Halo around the product
    const ringGeo = new THREE.TorusGeometry(125, 1.4, 16, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.8;
    scene.add(ringMesh);

    // Secondary subtle ruby ring
    const ringGeo2 = new THREE.TorusGeometry(140, 0.8, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xfea095,
      transparent: true,
      opacity: 0.2,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = Math.PI / 2.3;
    ringMesh2.rotation.y = Math.PI / 6;
    scene.add(ringMesh2);

    // Burst expansion physics
    let burstVelocity = 0;
    burstActionRef.current = () => {
      burstVelocity = 3.5;
    };

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = (performance.now() - startTime) * 0.001;

      // Rotate particle cloud gently + react to mouse
      particles.rotation.y = time * 0.09 + mouseX * 0.5;
      particles.rotation.x = Math.sin(time * 0.06) * 0.12 - mouseY * 0.4;

      ringMesh.rotation.z = time * 0.2;
      ringMesh.rotation.y = Math.cos(time * 0.12) * 0.25 + mouseX * 0.6;

      ringMesh2.rotation.z = -time * 0.15;
      ringMesh2.rotation.x = Math.sin(time * 0.1) * 0.2 - mouseY * 0.4;

      // Handle position drift and burst recovery
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      if (burstVelocity > 0.01) {
        burstVelocity *= 0.92;
      } else {
        burstVelocity = 0;
      }

      for (let i = 0; i < particleCount; i++) {
        const ox = originalPos[i * 3];
        const oy = originalPos[i * 3 + 1];
        const oz = originalPos[i * 3 + 2];

        // Float wave
        const wave = Math.sin(time * 1.5 + i * 0.2) * 4;

        if (burstVelocity > 0.05) {
          posArr[i * 3] += (ox / 100) * burstVelocity * 4;
          posArr[i * 3 + 1] += (oy / 100) * burstVelocity * 4;
          posArr[i * 3 + 2] += (oz / 100) * burstVelocity * 4;
        } else {
          // Gently ease back to orbital position
          posArr[i * 3] += (ox - posArr[i * 3]) * 0.04;
          posArr[i * 3 + 1] += (oy + wave - posArr[i * 3 + 1]) * 0.04;
          posArr[i * 3 + 2] += (oz - posArr[i * 3 + 2]) * 0.04;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute -inset-10 pointer-events-none z-0 overflow-visible"
      style={{ opacity: 0.95 }}
    />
  );
}
