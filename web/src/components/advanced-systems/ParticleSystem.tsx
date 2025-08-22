'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface Particle {
  position: [number, number, number];
  velocity: [number, number, number];
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticleSystemProps {
  count?: number;
  theme?: 'default' | 'energy' | 'cosmic' | 'nature' | 'tech';
  intensity?: number;
  className?: string;
}

const ParticleField: React.FC<{ 
  count: number; 
  theme: string; 
  intensity: number 
}> = ({ count, theme, intensity }) => {
  const points = useRef<THREE.Points>(null);
  const { camera } = useThree();
  
  const particles = useMemo(() => {
    const temp: Particle[] = [];
    const colors = {
      default: ['#06b6d4', '#3b82f6', '#8b5cf6'],
      energy: ['#fbbf24', '#f97316', '#ef4444'],
      cosmic: ['#8b5cf6', '#ec4899', '#06b6d4'],
      nature: ['#22c55e', '#10b981', '#059669'],
      tech: ['#06b6d4', '#3b82f6', '#1e40af']
    };
    
    for (let i = 0; i < count; i++) {
      const time = Date.now() * 0.0001;
      const factor = 20 + Math.sin(i / 100) * 100;
      const speed = 0.01 + Math.sin(i / 100) * 0.01;
      const x = Math.cos((i / 100) * Math.PI * 2) * factor;
      const y = Math.sin((i / 100) * Math.PI * 2) * factor;
      const z = Math.sin(i / 100) * factor;
      
      temp.push({
        position: [x, y, z],
        velocity: [
          Math.sin(time + i) * speed * intensity,
          Math.cos(time + i) * speed * intensity,
          Math.sin(time + i * 0.5) * speed * intensity
        ],
        size: Math.random() * 2 + 0.5,
        color: colors[theme as keyof typeof colors][Math.floor(Math.random() * 3)],
        life: Math.random(),
        maxLife: 1
      });
    }
    return temp;
  }, [count, theme, intensity]);

  useFrame((state) => {
    if (!points.current) return;
    
    const time = state.clock.getElapsedTime();
    const positions = points.current.geometry.attributes.position.array as Float32Array;
    
    particles.forEach((particle, i) => {
      const idx = i * 3;
      
      // Update particle life
      particle.life += 0.01;
      if (particle.life > particle.maxLife) {
        particle.life = 0;
      }
      
      // Apply physics
      particle.position[0] += particle.velocity[0];
      particle.position[1] += particle.velocity[1];
      particle.position[2] += particle.velocity[2];
      
      // Add some wave motion
      particle.position[1] += Math.sin(time + i * 0.1) * 0.01;
      
      // Bounce off boundaries
      if (Math.abs(particle.position[0]) > 50) particle.velocity[0] *= -0.8;
      if (Math.abs(particle.position[1]) > 50) particle.velocity[1] *= -0.8;
      if (Math.abs(particle.position[2]) > 50) particle.velocity[2] *= -0.8;
      
      // Update positions
      positions[idx] = particle.position[0];
      positions[idx + 1] = particle.position[1];
      positions[idx + 2] = particle.position[2];
    });
    
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    particles.forEach((particle, i) => {
      pos[i * 3] = particle.position[0];
      pos[i * 3 + 1] = particle.position[1];
      pos[i * 3 + 2] = particle.position[2];
    });
    return pos;
  }, [particles, count]);

  const colors = useMemo(() => {
    const cols = new Float32Array(count * 3);
    particles.forEach((particle, i) => {
      const color = new THREE.Color(particle.color);
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    });
    return cols;
  }, [particles, count]);

  return (
    <Points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        size={2}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  count = 1000,
  theme = 'default',
  intensity = 1,
  className = ''
}) => {
  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <Canvas
        camera={{ position: [0, 0, 50], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ParticleField count={count} theme={theme} intensity={intensity} />
      </Canvas>
    </motion.div>
  );
};