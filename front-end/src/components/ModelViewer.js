import React, { useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import { Eevee } from './Eevee.js'
import '../styles/modelViewer.css'

const ModelViewer = () => {

    const ref = useRef()

    return (
        <div className="modelContainer">
            <Canvas size={[`2000px`, `4000px`]} shadows dpr={[1, 2]} camera={{ fov: 40, position: [40, 0, 0] }}>
                <Suspense fallback={null}>
                    <Stage controls={ref} preset="rembrandt" intensity={1} environment="lobby">
                    <directionalLight position={[-5, 10, -35]} intensity={2.0} color="red" />
                    <directionalLight position={[5, 10, 5]} intensity={2.0}  color="blue"/>
                    <ambientLight intensity={0.3} />
                        false
                        <Eevee />
                        false
                    </Stage>
                </Suspense>
                <OrbitControls ref={ref}  /> {/* autoRotate */}
            </Canvas>
        </div>
    )
}

export default ModelViewer;