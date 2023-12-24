import React, { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import { Eevee } from './Eevee.js'
import '../styles/modelViewer.css'

const ModelViewer = () => {

    const ref = useRef()
    return (
        <div className="modelContainer">
            <Canvas size={[`2000px`,`3000px`]} shadows dpr={[1, 2]} camera={{ fov: 20 }}>
                <Suspense fallback={null}>
                    <Stage controls={ref} preset="rembrandt" intensity={1} environment="city">
                        false
                        <Eevee />
                        false
                    </Stage>
                </Suspense>
                <OrbitControls ref={ref} autoRotate />
            </Canvas>
        </div>

    )
}

export default ModelViewer;