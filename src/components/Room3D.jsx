import React, { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment, ContactShadows, SoftShadows } from '@react-three/drei'
import { EffectComposer, Bloom, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import Furniture from './Furniture'

function Room() {
  const roomSize = 8
  const wallHeight = 3

  return (
    <group>
      {/* Floor with better material */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshPhysicalMaterial
          color="#e8e0d5"
          roughness={0.8}
          metalness={0}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* Grid helper on floor */}
      <Grid
        position={[0, 0.01, 0]}
        args={[roomSize, roomSize]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#d0d0d0"
        sectionSize={2}
        sectionThickness={0.6}
        sectionColor="#b0b0b0"
        fadeDistance={15}
        fadeStrength={1}
        infiniteGrid={false}
      />

      {/* Back wall */}
      <mesh position={[0, wallHeight / 2, -roomSize / 2]} receiveShadow>
        <planeGeometry args={[roomSize, wallHeight]} />
        <meshPhysicalMaterial
          color="#f8f8f5"
          roughness={0.9}
          metalness={0}
          envMapIntensity={0.2}
        />
      </mesh>

      {/* Left wall */}
      <mesh position={[-roomSize / 2, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[roomSize, wallHeight]} />
        <meshPhysicalMaterial
          color="#f5f5f2"
          roughness={0.9}
          metalness={0}
          envMapIntensity={0.2}
        />
      </mesh>

      {/* Right wall */}
      <mesh position={[roomSize / 2, wallHeight / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[roomSize, wallHeight]} />
        <meshPhysicalMaterial
          color="#f5f5f2"
          roughness={0.9}
          metalness={0}
          envMapIntensity={0.2}
        />
      </mesh>

      {/* Baseboard - back */}
      <mesh position={[0, 0.05, -roomSize / 2 + 0.02]}>
        <boxGeometry args={[roomSize, 0.1, 0.04]} />
        <meshPhysicalMaterial color="#d4c4a8" roughness={0.7} />
      </mesh>

      {/* Baseboard - left */}
      <mesh position={[-roomSize / 2 + 0.02, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[roomSize, 0.1, 0.04]} />
        <meshPhysicalMaterial color="#d4c4a8" roughness={0.7} />
      </mesh>

      {/* Baseboard - right */}
      <mesh position={[roomSize / 2 - 0.02, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[roomSize, 0.1, 0.04]} />
        <meshPhysicalMaterial color="#d4c4a8" roughness={0.7} />
      </mesh>
    </group>
  )
}

export default function Room3D({ furniture, onFurnitureClick, selectedId, canvasRef }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        ref={canvasRef}
        shadows="soft"
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          preserveDrawingBuffer: true
        }}
        camera={{ position: [8, 6, 8], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #e8ecf0 0%, #f5f7fa 100%)' }}
      >
        {/* Soft shadows configuration */}
        <SoftShadows size={25} samples={16} focus={0.5} />

        {/* Environment for realistic reflections */}
        <Environment preset="apartment" background={false} />

        {/* Lighting setup */}
        <ambientLight intensity={0.4} />

        {/* Main key light */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0001}
        />

        {/* Fill light */}
        <directionalLight position={[-5, 5, -5]} intensity={0.3} />

        {/* Rim light for depth */}
        <directionalLight position={[0, 8, -8]} intensity={0.2} />

        {/* Room structure */}
        <Room />

        {/* Contact shadows for grounded look */}
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.4}
          scale={12}
          blur={2}
          far={4}
        />

        {/* Furniture items */}
        {furniture.map((item) => (
          <Furniture
            key={item.id}
            item={item}
            onClick={() => onFurnitureClick?.(item.id)}
            selected={selectedId === item.id}
          />
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
          enableDamping={true}
          dampingFactor={0.05}
        />

        {/* Post-processing effects */}
        <EffectComposer>
          <N8AO
            aoRadius={0.5}
            intensity={1}
            aoSamples={6}
            denoiseSamples={4}
          />
          <Bloom
            luminanceThreshold={0.9}
            luminanceSmoothing={0.025}
            intensity={0.3}
            radius={0.8}
          />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette eskil={false} offset={0.1} darkness={0.3} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
