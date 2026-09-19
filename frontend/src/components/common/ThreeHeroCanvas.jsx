import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeHeroCanvas
 * Clean, high-performance React component wrapping Google Stitch's Three.js 3D Tech Core
 * and Constellation Particle Matrix scene.
 * Features:
 * - Inner luminous icosahedron with faceted wireframe shell & outer cage
 * - 3 glowing orbital pathways (learning pathways)
 * - Constellation matrix with dynamic proximity network lines
 * - Smooth mouse parallax reaction and graceful resize handling
 * - Proper cleanup on component unmount
 */
export default function ThreeHeroCanvas() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let width = container.clientWidth || window.innerWidth;
        let height = container.clientHeight || window.innerHeight;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
        camera.position.z = 24;
        camera.position.y = 1;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);

        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x312e81, 1.8);
        scene.add(ambientLight);

        const cyanPoint = new THREE.PointLight(0x06b6d4, 3.5, 70);
        cyanPoint.position.set(16, 12, 14);
        scene.add(cyanPoint);

        const indigoPoint = new THREE.PointLight(0x6366f1, 3.0, 70);
        indigoPoint.position.set(-16, -10, 10);
        scene.add(indigoPoint);

        const amberPoint = new THREE.PointLight(0xf59e0b, 2.0, 50);
        amberPoint.position.set(0, 14, -8);
        scene.add(amberPoint);

        // Main Central Tech Core Group - positioned behind the right-hand dashboard card
        const coreGroup = new THREE.Group();
        coreGroup.position.set(4.5, 0.5, -1.5);
        scene.add(coreGroup);

        // 1. Inner Luminous Polyhedron
        const innerGeo = new THREE.IcosahedronGeometry(4.2, 1);
        const innerMat = new THREE.MeshPhongMaterial({
            color: 0x4f46e5,
            emissive: 0x1e1b4b,
            flatShading: true,
            shininess: 90,
            transparent: true,
            opacity: 0.82
        });
        const innerCore = new THREE.Mesh(innerGeo, innerMat);
        coreGroup.add(innerCore);

        // 2. Faceted Wireframe Shell
        const wireGeo = new THREE.IcosahedronGeometry(4.35, 1);
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            wireframe: true,
            transparent: true,
            opacity: 0.65
        });
        const wireShell = new THREE.Mesh(wireGeo, wireMat);
        coreGroup.add(wireShell);

        // 3. Floating Geometric Outer Cage
        const outerGeo = new THREE.IcosahedronGeometry(7.2, 0);
        const outerMat = new THREE.MeshBasicMaterial({
            color: 0x818cf8,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        });
        const outerCage = new THREE.Mesh(outerGeo, outerMat);
        coreGroup.add(outerCage);

        // 4. Glowing Orbital Rings
        const ringGeo1 = new THREE.TorusGeometry(8.8, 0.07, 16, 100);
        const ringMat1 = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.55
        });
        const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
        ring1.rotation.x = Math.PI / 3;
        ring1.rotation.y = Math.PI / 6;
        coreGroup.add(ring1);

        const ringGeo2 = new THREE.TorusGeometry(10.5, 0.05, 16, 100);
        const ringMat2 = new THREE.MeshBasicMaterial({
            color: 0xa855f7,
            transparent: true,
            opacity: 0.45
        });
        const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
        ring2.rotation.x = -Math.PI / 4;
        ring2.rotation.z = Math.PI / 5;
        coreGroup.add(ring2);

        const ringGeo3 = new THREE.TorusGeometry(12.0, 0.04, 16, 120);
        const ringMat3 = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            transparent: true,
            opacity: 0.35
        });
        const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
        ring3.rotation.y = Math.PI / 3;
        coreGroup.add(ring3);

        // 5. Constellation Matrix Particles
        const particleCount = 110;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleVelocities = [];

        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * 58;
            const y = (Math.random() - 0.5) * 36;
            const z = (Math.random() - 0.5) * 32;
            particlePositions[i * 3] = x;
            particlePositions[i * 3 + 1] = y;
            particlePositions[i * 3 + 2] = z;

            particleVelocities.push({
                vx: (Math.random() - 0.5) * 0.016,
                vy: (Math.random() - 0.5) * 0.016,
                vz: (Math.random() - 0.5) * 0.016
            });
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

        const particleMat = new THREE.PointsMaterial({
            color: 0x38bdf8,
            size: 0.48,
            transparent: true,
            opacity: 0.75
        });
        const particleSystem = new THREE.Points(particleGeometry, particleMat);
        scene.add(particleSystem);

        // Constellation Connecting Lines
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x4f46e5,
            transparent: true,
            opacity: 0.22
        });

        let lineSegments = null;
        const maxDistance = 7.5;

        const updateNetworkLines = () => {
            if (lineSegments) {
                scene.remove(lineSegments);
                lineSegments.geometry.dispose();
            }

            const pos = particleGeometry.attributes.position.array;
            const linePositions = [];

            for (let i = 0; i < particleCount; i++) {
                for (let j = i + 1; j < particleCount; j++) {
                    const dx = pos[i * 3] - pos[j * 3];
                    const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
                    const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < maxDistance) {
                        linePositions.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
                        linePositions.push(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
                    }
                }
            }

            const lineGeo = new THREE.BufferGeometry();
            lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
            lineSegments = new THREE.LineSegments(lineGeo, lineMaterial);
            scene.add(lineSegments);
        };

        // Mouse Parallax
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const handleMouseMove = (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.0012;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.0012;
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        // Resize Listener
        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth || window.innerWidth;
            const h = container.clientHeight || window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);

        // Animation Loop
        let animationFrameId;
        const clock = new THREE.Clock();
        let frameCount = 0;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            frameCount++;
            const elapsedTime = clock.getElapsedTime();

            // Smooth lerp
            targetX += (mouseX - targetX) * 0.05;
            targetY += (mouseY - targetY) * 0.05;

            // Rotate core
            coreGroup.rotation.y = elapsedTime * 0.22 + targetX * 1.8;
            coreGroup.rotation.x = Math.sin(elapsedTime * 0.18) * 0.12 + targetY * 1.2;

            innerCore.rotation.y = -elapsedTime * 0.3;
            wireShell.rotation.y = elapsedTime * 0.15;
            wireShell.rotation.z = -elapsedTime * 0.1;
            outerCage.rotation.z = elapsedTime * 0.12;

            ring1.rotation.z = elapsedTime * 0.28;
            ring2.rotation.x = elapsedTime * 0.22;
            ring3.rotation.y = elapsedTime * 0.18;

            // Move particles gently
            const positions = particleGeometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += particleVelocities[i].vx;
                positions[i * 3 + 1] += particleVelocities[i].vy;
                positions[i * 3 + 2] += particleVelocities[i].vz;

                if (Math.abs(positions[i * 3]) > 29) particleVelocities[i].vx *= -1;
                if (Math.abs(positions[i * 3 + 1]) > 18) particleVelocities[i].vy *= -1;
                if (Math.abs(positions[i * 3 + 2]) > 16) particleVelocities[i].vz *= -1;
            }
            particleGeometry.attributes.position.needsUpdate = true;

            // Update lines every 2 frames for optimal performance
            if (frameCount % 2 === 0) {
                updateNetworkLines();
            }

            // Camera drift
            camera.position.x = Math.sin(elapsedTime * 0.12) * 1.0 + targetX * 3.5;
            camera.position.y = 1 + Math.cos(elapsedTime * 0.15) * 0.6 - targetY * 3.5;
            camera.lookAt(coreGroup.position.x * 0.4, coreGroup.position.y * 0.4, 0);

            renderer.render(scene, camera);
        };

        animate();

        // Teardown
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);

            if (container && renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }

            // Dispose geometries and materials
            innerGeo.dispose();
            innerMat.dispose();
            wireGeo.dispose();
            wireMat.dispose();
            outerGeo.dispose();
            outerMat.dispose();
            ringGeo1.dispose();
            ringMat1.dispose();
            ringGeo2.dispose();
            ringMat2.dispose();
            ringGeo3.dispose();
            ringMat3.dispose();
            particleGeometry.dispose();
            particleMat.dispose();
            lineMaterial.dispose();
            if (lineSegments) {
                lineSegments.geometry.dispose();
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 bg-transparent"
            style={{ display: 'block' }}
        />
    );
}
