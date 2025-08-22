'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface DynamicIllustrationProps {
  type: 'person' | 'scene' | 'abstract' | 'icon';
  context: 'morning' | 'afternoon' | 'evening' | 'night' | 'event' | 'user';
  className?: string;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
}

// Ilustración de persona que se mueve según la hora
const DynamicPerson: React.FC<{ context: string }> = ({ context }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Movimiento suave de respiración
      meshRef.current.position.y = Math.sin(time * 2) * 0.1;
      
      // Rotación sutil
      meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      
      // Movimientos específicos según el contexto
      switch (context) {
        case 'morning':
          meshRef.current.rotation.z = Math.sin(time * 3) * 0.05; // Despertando
          break;
        case 'afternoon':
          meshRef.current.rotation.x = Math.sin(time * 2) * 0.03; // Activo
          break;
        case 'evening':
          meshRef.current.rotation.y = Math.sin(time * 1.5) * 0.08; // Relajado
          break;
        case 'night':
          meshRef.current.rotation.z = Math.sin(time * 0.8) * 0.02; // Tranquilo
          break;
      }
    }
  });

  const getPersonColor = (context: string) => {
    switch (context) {
      case 'morning': return '#fbbf24'; // Amarillo soleado
      case 'afternoon': return '#f97316'; // Naranja energético
      case 'evening': return '#8b5cf6'; // Púrpura romántico
      case 'night': return '#1e40af'; // Azul nocturno
      default: return '#06b6d4';
    }
  };

  const color = getPersonColor(context);

  return (
    <group
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Cabeza */}
      <Sphere args={[0.3, 16, 16]} position={[0, 0.8, 0]}>
        <meshStandardMaterial
          color={color}
          metalness={0.1}
          roughness={0.8}
        />
      </Sphere>
      
      {/* Cuerpo */}
      <Cylinder args={[0.2, 0.3, 0.8]} position={[0, 0.1, 0]}>
        <meshStandardMaterial
          color={color}
          metalness={0.1}
          roughness={0.8}
        />
      </Cylinder>
      
      {/* Brazos */}
      <Box args={[0.1, 0.6, 0.1]} position={[-0.4, 0.2, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Box args={[0.1, 0.6, 0.1]} position={[0.4, 0.2, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      
      {/* Piernas */}
      <Box args={[0.1, 0.6, 0.1]} position={[-0.15, -0.4, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Box args={[0.1, 0.6, 0.1]} position={[0.15, -0.4, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      
      {/* Efecto de brillo en hover */}
      {hovered && (
        <Sphere args={[0.5, 16, 16]} position={[0, 0.8, 0]}>
          <meshStandardMaterial
            color="white"
            transparent
            opacity={0.3}
            emissive="white"
            emissiveIntensity={0.5}
          />
        </Sphere>
      )}
    </group>
  );
};

// Ilustración de escena que evoluciona con el scroll
const DynamicScene: React.FC<{ context: string }> = ({ context }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Rotación basada en scroll
      groupRef.current.rotation.y = (scrollY / 1000) * Math.PI * 2;
      
      // Movimiento ondulante
      groupRef.current.position.y = Math.sin(time + scrollY * 0.01) * 0.1;
    }
  });

  const getSceneElements = (context: string) => {
    switch (context) {
      case 'morning':
        return [
          { type: 'sun', position: [2, 2, 0], color: '#fbbf24', size: 0.5 },
          { type: 'cloud', position: [-1, 1.5, 0], color: '#e5e7eb', size: 0.3 },
          { type: 'tree', position: [-2, -0.5, 0], color: '#10b981', size: 0.8 }
        ];
      case 'afternoon':
        return [
          { type: 'sun', position: [0, 2, 0], color: '#f97316', size: 0.6 },
          { type: 'cloud', position: [1.5, 1.8, 0], color: '#d1d5db', size: 0.4 },
          { type: 'building', position: [2, -0.2, 0], color: '#6b7280', size: 1 }
        ];
      case 'evening':
        return [
          { type: 'moon', position: [-1, 1.5, 0], color: '#8b5cf6', size: 0.4 },
          { type: 'star', position: [1, 2, 0], color: '#fbbf24', size: 0.1 },
          { type: 'mountain', position: [0, -0.8, 0], color: '#374151', size: 1.2 }
        ];
      case 'night':
        return [
          { type: 'moon', position: [0, 1.8, 0], color: '#1e40af', size: 0.5 },
          { type: 'star', position: [-1.5, 2.2, 0], color: '#fbbf24', size: 0.08 },
          { type: 'star', position: [1.5, 2.1, 0], color: '#fbbf24', size: 0.12 },
          { type: 'mountain', position: [0, -0.8, 0], color: '#1f2937', size: 1.2 }
        ];
      default:
        return [];
    }
  };

  const elements = getSceneElements(context);

  return (
    <group ref={groupRef}>
      {elements.map((element, index) => (
        <group key={index} position={element.position as [number, number, number]}>
          {element.type === 'sun' && (
            <Sphere args={[element.size, 16, 16]}>
              <meshStandardMaterial
                color={element.color}
                emissive={element.color}
                emissiveIntensity={0.5}
              />
            </Sphere>
          )}
          
          {element.type === 'moon' && (
            <Sphere args={[element.size, 16, 16]}>
              <meshStandardMaterial
                color={element.color}
                metalness={0.8}
                roughness={0.2}
              />
            </Sphere>
          )}
          
          {element.type === 'cloud' && (
            <group>
              {[...Array(3)].map((_, i) => (
                <Sphere
                  key={i}
                  args={[element.size * 0.6, 16, 16]}
                  position={[i * 0.3 - 0.3, 0, 0]}
                >
                  <meshStandardMaterial
                    color={element.color}
                    transparent
                    opacity={0.8}
                  />
                </Sphere>
              ))}
            </group>
          )}
          
          {element.type === 'star' && (
            <Box args={[0.02, 0.02, 0.02]}>
              <meshStandardMaterial
                color={element.color}
                emissive={element.color}
                emissiveIntensity={1}
              />
            </Box>
          )}
          
          {element.type === 'tree' && (
            <group>
              <Cylinder args={[0.1, 0.1, 0.6]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#8b5a2b" />
              </Cylinder>
              <Sphere args={[0.4, 16, 16]} position={[0, 0.5, 0]}>
                <meshStandardMaterial color={element.color} />
              </Sphere>
            </group>
          )}
          
          {element.type === 'building' && (
            <Box args={[0.8, 1.2, 0.6]}>
              <meshStandardMaterial color={element.color} />
            </Box>
          )}
          
          {element.type === 'mountain' && (
            <Box args={[2, 1.5, 0.8]} position={[0, -0.75, 0]}>
              <meshStandardMaterial color={element.color} />
            </Box>
          )}
        </group>
      ))}
    </group>
  );
};

// Iconos que cambian según el estado
const DynamicIcon: React.FC<{ context: string; type: string }> = ({ context, type }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Rotación continua
      meshRef.current.rotation.y = time * 0.5;
      
      // Escala pulsante en hover
      if (hovered) {
        meshRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.1);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  const getIconGeometry = (type: string) => {
    switch (type) {
      case 'heart':
        return <Sphere args={[0.5, 16, 16]} />;
      case 'star':
        return <Box args={[0.8, 0.8, 0.8]} />;
      case 'diamond':
        return <Box args={[0.6, 0.6, 0.6]} />;
      default:
        return <Sphere args={[0.5, 16, 16]} />;
    }
  };

  const getIconColor = (context: string) => {
    switch (context) {
      case 'morning': return '#fbbf24';
      case 'afternoon': return '#f97316';
      case 'evening': return '#8b5cf6';
      case 'night': return '#1e40af';
      default: return '#06b6d4';
    }
  };

  const color = getIconColor(context);

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh ref={meshRef}>
        {getIconGeometry(type)}
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      
      {/* Efecto de partículas en hover */}
      {hovered && (
        <group>
          {[...Array(8)].map((_, i) => (
            <motion.mesh
              key={i}
              position={[
                Math.cos(i * Math.PI * 2 / 8) * 1,
                Math.sin(i * Math.PI * 2 / 8) * 1,
                0
              ]}
            >
              <Sphere args={[0.05, 8, 8]}>
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={1}
                />
              </Sphere>
            </motion.mesh>
          ))}
        </group>
      )}
    </group>
  );
};

// Componente principal
export const DynamicIllustration: React.FC<DynamicIllustrationProps> = ({
  type,
  context,
  className = '',
  size = 'medium',
  interactive = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small': return 'w-16 h-16';
      case 'medium': return 'w-32 h-32';
      case 'large': return 'w-64 h-64';
      default: return 'w-32 h-32';
    }
  };

  const sizeClasses = getSizeClasses(size);

  return (
    <motion.div
      ref={containerRef}
      className={`${sizeClasses} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8
      }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        
        {type === 'person' && <DynamicPerson context={context} />}
        {type === 'scene' && <DynamicScene context={context} />}
        {type === 'icon' && <DynamicIcon context={context} type="star" />}
        
        {/* Efectos de partículas de fondo */}
        {interactive && (
          <group>
            {[...Array(20)].map((_, i) => (
              <mesh
                key={i}
                position={[
                  (Math.random() - 0.5) * 10,
                  (Math.random() - 0.5) * 10,
                  (Math.random() - 0.5) * 10
                ]}
              >
                <Sphere args={[0.02, 8, 8]}>
                  <meshStandardMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.3}
                  />
                </Sphere>
              </mesh>
            ))}
          </group>
        )}
      </Canvas>
    </motion.div>
  );
};

// Hook para usar ilustraciones dinámicas
export const useDynamicIllustration = () => {
  const getCurrentContext = (): string => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  const getEventContext = (eventType: string): string => {
    const eventContexts: Record<string, string> = {
      'music': 'evening',
      'tech': 'afternoon',
      'art': 'morning',
      'nature': 'morning',
      'sports': 'afternoon',
      'romantic': 'evening'
    };
    
    return eventContexts[eventType] || 'afternoon';
  };

  return {
    getCurrentContext,
    getEventContext
  };
};