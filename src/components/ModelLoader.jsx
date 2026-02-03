import React, { Suspense, useMemo } from 'react'
import { useGLTF, Clone } from '@react-three/drei'
import * as THREE from 'three'

// Fallback box while model loads
function LoadingBox({ color }) {
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshPhysicalMaterial color={color || '#808080'} transparent opacity={0.5} />
    </mesh>
  )
}

// GLB Model component
function GLBModel({ modelPath, color, scale = 1, rotation = { y: 0 } }) {
  const { scene } = useGLTF(modelPath)

  // Clone the scene and apply color tint if provided
  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true)

    // Apply color tint to all materials
    if (color) {
      cloned.traverse((child) => {
        if (child.isMesh && child.material) {
          // Clone material to avoid affecting other instances
          child.material = child.material.clone()

          // Create tinted color
          const tintColor = new THREE.Color(color)

          // For models, we blend the original color with the tint
          if (child.material.color) {
            child.material.color.lerp(tintColor, 0.3)
          }

          // Enhance material for premium look
          if (child.material.isMeshStandardMaterial) {
            child.material.envMapIntensity = 0.8
            child.material.roughness = Math.max(0.3, child.material.roughness || 0.5)
          }

          // Enable shadows
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    } else {
      // Just enable shadows
      cloned.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }

    return cloned
  }, [scene, color])

  return (
    <primitive
      object={clonedScene}
      scale={scale}
      rotation={[0, rotation.y || 0, 0]}
    />
  )
}

// Main ModelLoader component with Suspense
export default function ModelLoader({ modelPath, color, scale, rotation, position }) {
  const pos = position ? [position.x || 0, position.y || 0, position.z || 0] : [0, 0, 0]

  return (
    <group position={pos}>
      <Suspense fallback={<LoadingBox color={color} />}>
        <GLBModel
          modelPath={modelPath}
          color={color}
          scale={scale}
          rotation={rotation}
        />
      </Suspense>
    </group>
  )
}

// Preload common models for better UX
export function preloadModels() {
  const commonModels = [
    '/models/sofa.glb',
    '/models/chair.glb',
    '/models/table.glb',
    '/models/lamp.glb',
    '/models/bed.glb',
    '/models/wardrobe.glb',
    '/models/plant.glb',
    '/models/tv.glb',
  ]

  commonModels.forEach(path => {
    try {
      useGLTF.preload(path)
    } catch (e) {
      // Model might not exist yet, that's ok
    }
  })
}
