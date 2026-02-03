import React from 'react'

// Helper component for legs
function Legs({ count = 4, height = 0.1, radius = 0.03, positions, color = '#4a4a4a' }) {
  return positions.map((pos, i) => (
    <mesh key={i} position={[pos[0], height / 2, pos[1]]} castShadow>
      <cylinderGeometry args={[radius, radius, height, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  ))
}

// Sofa component
export function Sofa({ position, color, size, legs }) {
  const { width = 2, depth = 0.9, height = 0.8 } = size || {}
  const legHeight = legs === 'high' ? 0.15 : legs === 'low' ? 0.08 : 0
  const seatHeight = 0.35
  const backHeight = height - seatHeight - legHeight

  const legPositions = [
    [-width/2 + 0.1, -depth/2 + 0.1],
    [width/2 - 0.1, -depth/2 + 0.1],
    [-width/2 + 0.1, depth/2 - 0.1],
    [width/2 - 0.1, depth/2 - 0.1],
  ]

  return (
    <group position={[position.x, legHeight, position.z]}>
      {/* Seat */}
      <mesh position={[0, seatHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, seatHeight, depth]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Backrest */}
      <mesh position={[0, seatHeight + backHeight / 2, -depth / 2 + 0.1]} castShadow receiveShadow>
        <boxGeometry args={[width, backHeight, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Armrests */}
      <mesh position={[-width / 2 + 0.08, seatHeight + 0.1, 0]} castShadow>
        <boxGeometry args={[0.15, 0.2, depth - 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[width / 2 - 0.08, seatHeight + 0.1, 0]} castShadow>
        <boxGeometry args={[0.15, 0.2, depth - 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Legs */}
      {legs !== 'none' && <Legs height={legHeight} positions={legPositions} />}
    </group>
  )
}

// Table component
export function Table({ position, color, size, legs }) {
  const { width = 1.2, depth = 0.8, height = 0.75 } = size || {}
  const legHeight = legs === 'high' ? height - 0.05 : legs === 'low' ? height - 0.1 : height - 0.05
  const topThickness = 0.05

  const legPositions = [
    [-width/2 + 0.05, -depth/2 + 0.05],
    [width/2 - 0.05, -depth/2 + 0.05],
    [-width/2 + 0.05, depth/2 - 0.05],
    [width/2 - 0.05, depth/2 - 0.05],
  ]

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Table top */}
      <mesh position={[0, height - topThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, topThickness, depth]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Legs */}
      <Legs height={legHeight} radius={0.04} positions={legPositions} color="#5c4033" />
    </group>
  )
}

// Chair component
export function Chair({ position, color, size, legs }) {
  const { width = 0.45, depth = 0.45, height = 0.9 } = size || {}
  const seatHeight = 0.45
  const legHeight = legs === 'high' ? 0.4 : legs === 'low' ? 0.35 : 0.38
  const seatThickness = 0.05
  const backHeight = height - seatHeight

  const legPositions = [
    [-width/2 + 0.04, -depth/2 + 0.04],
    [width/2 - 0.04, -depth/2 + 0.04],
    [-width/2 + 0.04, depth/2 - 0.04],
    [width/2 - 0.04, depth/2 - 0.04],
  ]

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Seat */}
      <mesh position={[0, legHeight + seatThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, seatThickness, depth]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Backrest */}
      <mesh position={[0, legHeight + seatThickness + backHeight / 2, -depth / 2 + 0.02]} castShadow receiveShadow>
        <boxGeometry args={[width - 0.04, backHeight, 0.04]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Legs */}
      <Legs height={legHeight} radius={0.02} positions={legPositions} />
    </group>
  )
}

// Lamp component
export function Lamp({ position, color, size }) {
  const { height = 1.5 } = size || {}
  const baseHeight = 0.05
  const poleHeight = height - 0.4
  const shadeHeight = 0.3

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Base */}
      <mesh position={[0, baseHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, baseHeight, 16]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Pole */}
      <mesh position={[0, baseHeight + poleHeight / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, poleHeight, 8]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Shade */}
      <mesh position={[0, baseHeight + poleHeight + shadeHeight / 2, 0]} castShadow>
        <coneGeometry args={[0.2, shadeHeight, 16, 1, true]} />
        <meshStandardMaterial color={color} side={2} />
      </mesh>

      {/* Light bulb effect */}
      <pointLight position={[0, baseHeight + poleHeight + 0.1, 0]} intensity={0.5} color="#fff9e6" distance={3} />
    </group>
  )
}

// Wardrobe component
export function Wardrobe({ position, color, size }) {
  const { width = 1.5, depth = 0.6, height = 2.2 } = size || {}

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Main body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Door line (visual detail) */}
      <mesh position={[0, height / 2, depth / 2 + 0.001]}>
        <planeGeometry args={[0.02, height - 0.1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Handles */}
      <mesh position={[-0.1, height / 2, depth / 2 + 0.02]} castShadow>
        <boxGeometry args={[0.02, 0.1, 0.02]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.1, height / 2, depth / 2 + 0.02]} castShadow>
        <boxGeometry args={[0.02, 0.1, 0.02]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

// Bed component
export function Bed({ position, color, size, legs }) {
  const { width = 1.6, depth = 2, height = 0.5 } = size || {}
  const legHeight = legs === 'high' ? 0.2 : legs === 'low' ? 0.1 : 0.15
  const mattressHeight = 0.25
  const frameHeight = 0.1
  const headboardHeight = 0.6

  const legPositions = [
    [-width/2 + 0.08, -depth/2 + 0.08],
    [width/2 - 0.08, -depth/2 + 0.08],
    [-width/2 + 0.08, depth/2 - 0.08],
    [width/2 - 0.08, depth/2 - 0.08],
  ]

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Frame */}
      <mesh position={[0, legHeight + frameHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, frameHeight, depth]} />
        <meshStandardMaterial color="#5c4033" />
      </mesh>

      {/* Mattress */}
      <mesh position={[0, legHeight + frameHeight + mattressHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width - 0.05, mattressHeight, depth - 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Headboard */}
      <mesh position={[0, legHeight + frameHeight + headboardHeight / 2, -depth / 2 + 0.05]} castShadow receiveShadow>
        <boxGeometry args={[width, headboardHeight, 0.08]} />
        <meshStandardMaterial color="#5c4033" />
      </mesh>

      {/* Pillow */}
      <mesh position={[0, legHeight + frameHeight + mattressHeight + 0.08, -depth / 2 + 0.4]} castShadow>
        <boxGeometry args={[width - 0.4, 0.15, 0.5]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Legs */}
      {legs !== 'none' && <Legs height={legHeight} radius={0.04} positions={legPositions} color="#5c4033" />}
    </group>
  )
}

// Main Furniture renderer
export default function Furniture({ item }) {
  const props = {
    position: item.position,
    color: item.color,
    size: item.size,
    legs: item.legs
  }

  switch (item.type) {
    case 'sofa':
      return <Sofa {...props} />
    case 'table':
      return <Table {...props} />
    case 'chair':
      return <Chair {...props} />
    case 'lamp':
      return <Lamp {...props} />
    case 'wardrobe':
      return <Wardrobe {...props} />
    case 'bed':
      return <Bed {...props} />
    default:
      return null
  }
}
