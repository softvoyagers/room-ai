import React from 'react'

// Render pojedynczego prymitywu 3D
function Primitive({ shape, position, size, color, rotation }) {
  const pos = [position.x || 0, position.y || 0, position.z || 0]
  const rot = [rotation?.x || 0, rotation?.y || 0, rotation?.z || 0]
  const { width = 0.5, height = 0.5, depth = 0.5 } = size || {}

  switch (shape) {
    case 'cylinder':
      return (
        <mesh position={pos} rotation={rot} castShadow receiveShadow>
          <cylinderGeometry args={[width / 2, width / 2, height, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )

    case 'sphere':
      return (
        <mesh position={pos} rotation={rot} castShadow receiveShadow>
          <sphereGeometry args={[width / 2, 16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )

    case 'cone':
      return (
        <mesh position={pos} rotation={rot} castShadow receiveShadow>
          <coneGeometry args={[width / 2, height, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )

    case 'box':
    default:
      return (
        <mesh position={pos} rotation={rot} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )
  }
}

// Główny komponent - renderuje dowolny przedmiot z parts
export default function Furniture({ item }) {
  const { position, parts } = item

  if (!parts || !Array.isArray(parts) || parts.length === 0) {
    // Fallback - prosty box
    return (
      <group position={[position.x, 0, position.z]}>
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#808080" />
        </mesh>
      </group>
    )
  }

  return (
    <group position={[position.x, 0, position.z]}>
      {parts.map((part, index) => (
        <Primitive
          key={index}
          shape={part.shape}
          position={part.position}
          size={part.size}
          color={part.color}
          rotation={part.rotation}
        />
      ))}
    </group>
  )
}
