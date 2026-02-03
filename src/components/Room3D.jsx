import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import Furniture from './Furniture'

function Room() {
  const roomSize = 8
  const wallHeight = 3

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial color="#e8e0d5" />
      </mesh>

      {/* Grid helper on floor */}
      <Grid
        position={[0, 0.01, 0]}
        args={[roomSize, roomSize]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#cccccc"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#999999"
        fadeDistance={20}
        infiniteGrid={false}
      />

      {/* Back wall */}
      <mesh position={[0, wallHeight / 2, -roomSize / 2]} receiveShadow>
        <planeGeometry args={[roomSize, wallHeight]} />
        <meshStandardMaterial color="#f5f5f0" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-roomSize / 2, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[roomSize, wallHeight]} />
        <meshStandardMaterial color="#f0f0eb" />
      </mesh>

      {/* Right wall */}
      <mesh position={[roomSize / 2, wallHeight / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[roomSize, wallHeight]} />
        <meshStandardMaterial color="#f0f0eb" />
      </mesh>

      {/* Baseboard - back */}
      <mesh position={[0, 0.05, -roomSize / 2 + 0.02]}>
        <boxGeometry args={[roomSize, 0.1, 0.04]} />
        <meshStandardMaterial color="#d4c4a8" />
      </mesh>

      {/* Baseboard - left */}
      <mesh position={[-roomSize / 2 + 0.02, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[roomSize, 0.1, 0.04]} />
        <meshStandardMaterial color="#d4c4a8" />
      </mesh>

      {/* Baseboard - right */}
      <mesh position={[roomSize / 2 - 0.02, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[roomSize, 0.1, 0.04]} />
        <meshStandardMaterial color="#d4c4a8" />
      </mesh>
    </group>
  )
}

export default function Room3D({ furniture }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        shadows
        camera={{ position: [8, 6, 8], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #E0E5EC 100%)' }}
      >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />

      {/* Room structure */}
      <Room />

      {/* Furniture items */}
      {furniture.map((item) => (
        <Furniture key={item.id} item={item} />
      ))}

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minDistance={3}
          maxDistance={20}
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  )
}
