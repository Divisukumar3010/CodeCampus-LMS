import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeAmbientParticles
 * Sleek, lightweight, interactive 3D background animation specifically crafted
 * for post-hero sections (Why Choose Us, Categories, Featured Courses, Compiler).
 *
 * Features:
 * - Floating 3D geometric nodes (dodecahedrons, octahedrons, tetrahedrons)
 * - Drifting constellation particles with soft glow connecting lines
 * - Subtle parallax mouse reaction and camera drift
 * - Extremely lightweight with low CPU/GPU footprint and proper unmount disposal
 */
export default function ThreeAmbientParticles() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let width = container.clientWidth || window.innerWidth;
        let height = container.clientHeight || window.innerHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.z = 28;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'low-power'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);

        container.appendChild(renderer.domElement);

        // Ambient Lights
        const ambientLight = new THREE.AmbientLight(0x4338ca, 1.2);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x06b6d4, 2.5, 60);
        pointLight1.position.set(-20, 10, 15);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xa855f7, 2.0, 60);
        pointLight2.position.set(20, -15, 10);
        scene.add(pointLight2);

        // Group of floating geometric wireframe crystals across the canvas
        const crystalGroup = new THREE.Group();
        scene.add(crystalGroup);

        const crystals = [];
        const crystalGeos = [
            new THREE.OctahedronGeometry(1.6, 0),
            new THREE.TetrahedronGeometry(1.4, 0),
            new THREE.IcosahedronGeometry(1.3, 0),
            new THREE.DodecahedronGeometry(1.5, 0)
        ];

        const crystalColors = [0x6366f1, 0x38bdf8, 0xa855f7, 0x06b6d4, 0x10b981];

        for (let i = 0; i < 9; i++) {
            const geo = crystalGeos[i % crystalGeos.length];
            const color = crystalColors[i % crystalColors.length];

            const mat = new THREE.MeshBasicMaterial({
                color: color,
                wireframe: true,
                transparent: true,
                opacity: 0.35 + (Math.random() * 0.25)
            });

            const mesh = new THREE.Mesh(geo, mat);

            // Spread horizontally and vertically
            mesh.position.set(
                (Math.random() - 0.5) * 52,
                (Math.random() - 0.5) * 38,
                (Math.random() - 0.5) * 16
            );

            mesh.userData = {
                rotX: (Math.random() - 0.5) * 0.015,
                rotY: (Math.random() - 0.5) * 0.018,
                rotZ: (Math.random() - 0.5) * 0.012,
                baseY: mesh.position.y,
                floatSpeed: 0.6 + Math.random() * 0.8,
                floatOffset: Math.random() * Math.PI * 2
            };

            crystalGroup.add(mesh);
            crystals.push(mesh);
        }

        // Particle Constellation
        const particleCount = 85;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 44;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

            velocities.push({
                vx: (Math.random() - 0.5) * 0.012,
                vy: (Math.random() - 0.5) * 0.012,
                vz: (Math.random() - 0.5) * 0.008
            });
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMat = new THREE.PointsMaterial({
            color: 0x818cf8,
            size: 0.42,
            transparent: true,
            opacity: 0.65
        });

        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // Network lines connecting particles
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.14
        });

        let lineSegments = null;
        const maxDist = 7.0;

        const updateNetworkLines = () => {
            if (lineSegments) {
                scene.remove(lineSegments);
                lineSegments.geometry.dispose();
            }

            const pos = particleGeo.attributes.position.array;
            const linePositions = [];

            for (let i = 0; i < particleCount; i++) {
                for (let j = i + 1; j < particleCount; j++) {
                    const dx = pos[i * 3] - pos[j * 3];
                    const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
                    const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < maxDist) {
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

        // Mouse reaction
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const handleMouseMove = (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.0008;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.0008;
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });

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

            targetX += (mouseX - targetX) * 0.04;
            targetY += (mouseY - targetY) * 0.04;

            // Rotate and float crystals
            crystals.forEach((mesh) => {
                mesh.rotation.x += mesh.userData.rotX;
                mesh.rotation.y += mesh.userData.rotY;
                mesh.rotation.z += mesh.userData.rotZ;
                mesh.position.y = mesh.userData.baseY + Math.sin(elapsedTime * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 0.8;
            });

            // Move constellation particles
            const pos = particleGeo.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                pos[i * 3] += velocities[i].vx;
                pos[i * 3 + 1] += velocities[i].vy;
                pos[i * 3 + 2] += velocities[i].vz;

                if (Math.abs(pos[i * 3]) > 30) velocities[i].vx *= -1;
                if (Math.abs(pos[i * 3 + 1]) > 22) velocities[i].vy *= -1;
                if (Math.abs(pos[i * 3 + 2]) > 10) velocities[i].vz *= -1;
            }
            particleGeo.attributes.position.needsUpdate = true;

            // Update network lines every 3 frames for super smooth 60fps
            if (frameCount % 3 === 0) {
                updateNetworkLines();
            }

            // Camera subtle drift
            camera.position.x = Math.sin(elapsedTime * 0.1) * 1.5 + targetX * 3.0;
            camera.position.y = Math.cos(elapsedTime * 0.08) * 1.0 - targetY * 3.0;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);

            if (container && renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }

            crystalGeos.forEach(g => g.dispose());
            crystals.forEach(c => {
                c.material.dispose();
            });
            particleGeo.dispose();
            particleMat.dispose();
            lineMaterial.dispose();
            if (lineSegments) lineSegments.geometry.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 bg-transparent overflow-hidden"
            style={{ display: 'block' }}
        />
    );
}
