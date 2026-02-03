import React, { Suspense, useMemo, useRef, useState } from 'react'
import { useGLTF, RoundedBox, Outlines } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Premium material settings based on material type
const MATERIAL_PRESETS = {
  wood: { roughness: 0.6, metalness: 0.0, clearcoat: 0.1 },
  metal: { roughness: 0.2, metalness: 0.9, clearcoat: 0.3 },
  fabric: { roughness: 0.9, metalness: 0.0, clearcoat: 0 },
  plastic: { roughness: 0.4, metalness: 0.1, clearcoat: 0.5 },
  glass: { roughness: 0.1, metalness: 0.0, clearcoat: 1, transmission: 0.9 },
  default: { roughness: 0.5, metalness: 0.1, clearcoat: 0.2 },
}

// Detect material type from color
function getMaterialPreset(color) {
  const c = color?.toLowerCase() || ''
  if (c.includes('8b4513') || c.includes('92400e') || c.includes('d4c4a8')) return 'wood'
  if (c.includes('1f2937') || c.includes('000000') || c.includes('silver')) return 'metal'
  if (c.includes('ffffff') && !c.includes('glass')) return 'plastic'
  return 'default'
}

// Enhanced Primitive with premium materials
function Primitive({ shape, position, size, color, rotation, materialType }) {
  const pos = [position.x || 0, position.y || 0, position.z || 0]
  const rot = [rotation?.x || 0, rotation?.y || 0, rotation?.z || 0]
  const { width = 0.5, height = 0.5, depth = 0.5 } = size || {}

  const preset = MATERIAL_PRESETS[materialType] || getMaterialPreset(color) || MATERIAL_PRESETS.default
  const materialProps = useMemo(() => ({
    color: color || '#808080',
    roughness: preset.roughness,
    metalness: preset.metalness,
    clearcoat: preset.clearcoat || 0,
    envMapIntensity: 0.8,
  }), [color, preset])

  switch (shape) {
    case 'cylinder':
      return (
        <mesh position={pos} rotation={rot} castShadow receiveShadow>
          <cylinderGeometry args={[width / 2, width / 2, height, 32]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      )

    case 'sphere':
      return (
        <mesh position={pos} rotation={rot} castShadow receiveShadow>
          <sphereGeometry args={[width / 2, 32, 32]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      )

    case 'cone':
      return (
        <mesh position={pos} rotation={rot} castShadow receiveShadow>
          <coneGeometry args={[width / 2, height, 32]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      )

    case 'torus':
      return (
        <mesh position={pos} rotation={rot} castShadow receiveShadow>
          <torusGeometry args={[width / 2, depth / 4, 16, 32]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      )

    case 'capsule':
      return (
        <mesh position={pos} rotation={rot} castShadow receiveShadow>
          <capsuleGeometry args={[width / 2, height - width, 8, 16]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      )

    case 'roundedBox':
      return (
        <RoundedBox
          args={[width, height, depth]}
          radius={0.05}
          smoothness={4}
          position={pos}
          rotation={rot}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial {...materialProps} />
        </RoundedBox>
      )

    case 'box':
    default:
      // Use RoundedBox for better appearance
      return (
        <RoundedBox
          args={[width, height, depth]}
          radius={0.02}
          smoothness={4}
          position={pos}
          rotation={rot}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial {...materialProps} />
        </RoundedBox>
      )
  }
}

// GLB Model component
function GLBModel({ modelPath, color, scale = 1, rotation = { y: 0 } }) {
  const { scene } = useGLTF(modelPath)

  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true)

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true

        if (child.material) {
          child.material = child.material.clone()

          // Enhance material
          if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
            child.material.envMapIntensity = 0.8

            // Apply color tint if provided
            if (color) {
              const tintColor = new THREE.Color(color)
              child.material.color.lerp(tintColor, 0.25)
            }
          }
        }
      }
    })

    return cloned
  }, [scene, color])

  return (
    <primitive
      object={clonedScene}
      scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
      rotation={[0, rotation.y || 0, 0]}
    />
  )
}

// Loading placeholder
function LoadingPlaceholder({ color }) {
  const ref = useRef()

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshPhysicalMaterial
        color={color || '#808080'}
        transparent
        opacity={0.6}
        wireframe
      />
    </mesh>
  )
}

// Main Furniture component - supports both GLB and procedural
export default function Furniture({ item, onClick, selected }) {
  const { position, parts, useModel, modelPath, scale, rotation, color } = item
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef()

  // Handle furniture position
  const furniturePosition = [position?.x || 0, 0, position?.z || 0]
  const furnitureRotation = [0, rotation?.y || 0, 0]

  // If using GLB model
  if (useModel && modelPath) {
    return (
      <group
        ref={groupRef}
        position={furniturePosition}
        rotation={furnitureRotation}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <Suspense fallback={<LoadingPlaceholder color={color} />}>
          <GLBModel
            modelPath={modelPath}
            color={color}
            scale={scale || 1}
            rotation={rotation}
          />
        </Suspense>
        {/* Selection outline */}
        {selected && (
          <mesh scale={[1.05, 1.05, 1.05]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.5} />
          </mesh>
        )}
      </group>
    )
  }

  // Procedural furniture from parts
  if (!parts || !Array.isArray(parts) || parts.length === 0) {
    // Fallback - simple rounded box
    return (
      <group
        ref={groupRef}
        position={furniturePosition}
        rotation={furnitureRotation}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <RoundedBox
          args={[0.5, 0.5, 0.5]}
          radius={0.05}
          smoothness={4}
          position={[0, 0.25, 0]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color={color || '#808080'}
            roughness={0.5}
            metalness={0.1}
            clearcoat={0.2}
            envMapIntensity={0.8}
          />
          {(selected || hovered) && (
            <Outlines thickness={0.03} color={selected ? '#3b82f6' : '#60a5fa'} />
          )}
        </RoundedBox>
      </group>
    )
  }

  return (
    <group
      ref={groupRef}
      position={furniturePosition}
      rotation={furnitureRotation}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      onPointerOver={() => {
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {parts.map((part, index) => (
        <Primitive
          key={index}
          shape={part.shape}
          position={part.position}
          size={part.size}
          color={part.color}
          rotation={part.rotation}
          materialType={part.material}
        />
      ))}
      {/* Selection indicator */}
      {selected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  )
}
