import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Draws official vector logo graphics onto a 256x256 canvas for each language/tech:
 * - HTML5: Official shield with orange facets and center 5 symbol
 * - CSS3: Official shield with blue facets and center 3 symbol
 * - JavaScript: Official gold shield/square with bold JS insignia
 * - React: Official atomic nucleus with 3 rotating blue orbital ellipses
 * - Python: Official dual-serpent logo (blue upper, yellow lower, eye dots)
 * - Java: Official coffee cup with rising red steam waves
 */
function drawOfficialLogo(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 256);

    // Rounded card tile
    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff';

    // Squircle tile with soft rounded corners
    ctx.beginPath();
    const r = 44;
    const x = 16, y = 16, w = 224, h = 224;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();

    // Subtle crisp border
    ctx.lineWidth = 4;
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(99, 102, 241, 0.20)';
    ctx.stroke();

    ctx.save();
    ctx.translate(128, 128); // center of the tile

    if (type === 'python') {
        // Official Python Logo (Dual intertwined blue & yellow snakes)
        ctx.scale(1.1, 1.1);

        // Top Blue Snake
        ctx.fillStyle = '#3776ab';
        ctx.beginPath();
        ctx.moveTo(-2, -50);
        ctx.lineTo(16, -50);
        ctx.arcTo(42, -50, 42, -24, 26);
        ctx.lineTo(42, -10);
        ctx.lineTo(14, -10);
        ctx.lineTo(14, 0);
        ctx.lineTo(-14, 0);
        ctx.arcTo(-34, 0, -34, -20, 20);
        ctx.lineTo(-34, -26);
        ctx.lineTo(-20, -26);
        ctx.arcTo(-8, -26, -8, -38, 12);
        ctx.lineTo(-8, -50);
        ctx.arcTo(-8, -50, -2, -50, 6);
        ctx.closePath();
        ctx.fill();

        // Blue Snake Eye (white dot)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-14, -38, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Bottom Yellow Snake (symmetric rotation)
        ctx.fillStyle = '#ffd43b';
        ctx.beginPath();
        ctx.moveTo(2, 50);
        ctx.lineTo(-16, 50);
        ctx.arcTo(-42, 50, -42, 24, 26);
        ctx.lineTo(-42, 10);
        ctx.lineTo(-14, 10);
        ctx.lineTo(-14, 0);
        ctx.lineTo(14, 0);
        ctx.arcTo(34, 0, 34, 20, 20);
        ctx.lineTo(34, 26);
        ctx.lineTo(20, 26);
        ctx.arcTo(8, 26, 8, 38, 12);
        ctx.lineTo(8, 50);
        ctx.arcTo(8, 50, 2, 50, 6);
        ctx.closePath();
        ctx.fill();

        // Yellow Snake Eye
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(14, 38, 4.5, 0, Math.PI * 2);
        ctx.fill();

    } else if (type === 'java') {
        // Official Java Coffee Cup Logo with authentic steam waves
        // Steam Waves (Red/Orange gradient tones)
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';

        // Left steam wave
        ctx.strokeStyle = '#e76f00';
        ctx.beginPath();
        ctx.moveTo(-18, -48);
        ctx.bezierCurveTo(-10, -36, -26, -24, -14, -12);
        ctx.stroke();

        // Center steam wave
        ctx.strokeStyle = '#f89820';
        ctx.beginPath();
        ctx.moveTo(0, -56);
        ctx.bezierCurveTo(10, -42, -10, -28, 2, -12);
        ctx.stroke();

        // Right steam wave
        ctx.strokeStyle = '#e76f00';
        ctx.beginPath();
        ctx.moveTo(18, -46);
        ctx.bezierCurveTo(26, -34, 8, -24, 16, -12);
        ctx.stroke();

        // Cup Body (Blue)
        ctx.fillStyle = '#5382a1';
        ctx.beginPath();
        ctx.moveTo(-36, -6);
        ctx.lineTo(26, -6);
        ctx.arcTo(28, 38, 0, 38, 28);
        ctx.lineTo(-8, 38);
        ctx.arcTo(-38, 38, -36, -6, 28);
        ctx.closePath();
        ctx.fill();

        // Cup Handle
        ctx.strokeStyle = '#5382a1';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(24, 12, 14, -Math.PI / 2.2, Math.PI / 2.2);
        ctx.stroke();

        // Bottom Saucer Ring
        ctx.strokeStyle = '#f89820';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(-5, 46, 38, 7, 0, 0, Math.PI * 2);
        ctx.stroke();

    } else if (type === 'cpp') {
        // Official C++ Hexagonal Shield Logo with ++ in Indigo/Cyan
        // Hexagonal outline
        ctx.fillStyle = '#00599c';
        ctx.beginPath();
        const hexR = 56;
        for (let a = 0; a < 6; a++) {
            const angle = (Math.PI / 3) * a - Math.PI / 6;
            const hx = Math.cos(angle) * hexR;
            const hy = Math.sin(angle) * hexR;
            if (a === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();

        // Lighter internal facet
        ctx.fillStyle = '#004482';
        ctx.beginPath();
        ctx.moveTo(0, -56);
        ctx.lineTo(48.5, -28);
        ctx.lineTo(48.5, 28);
        ctx.lineTo(0, 56);
        ctx.closePath();
        ctx.fill();

        // "C" and "++" white text
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px Inter, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('C++', 0, 2);

    } else if (type === 'js') {
        // Official JavaScript Yellow Square with bold 'JS'
        ctx.fillStyle = '#f7df1e';
        ctx.beginPath();
        ctx.roundRect(-52, -52, 104, 104, 14);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = '900 58px Inter, "Segoe UI", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('JS', 44, 46);

    } else if (type === 'ts') {
        // Official TypeScript Blue Square with bold 'TS'
        ctx.fillStyle = '#3178c6';
        ctx.beginPath();
        ctx.roundRect(-52, -52, 104, 104, 14);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 58px Inter, "Segoe UI", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('TS', 44, 46);

    } else if (type === 'react') {
        // Official React Atom Nucleus & Elliptical Orbits
        ctx.fillStyle = '#00d8ff';
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#00d8ff';
        ctx.lineWidth = 5.5;
        for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI) / 3);
            ctx.beginPath();
            ctx.ellipse(0, 0, 58, 22, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

    } else if (type === 'html') {
        // Official HTML5 Orange Shield with '5'
        ctx.fillStyle = '#e44d26';
        ctx.beginPath();
        ctx.moveTo(-50, -56);
        ctx.lineTo(50, -56);
        ctx.lineTo(41, 48);
        ctx.lineTo(0, 60);
        ctx.lineTo(-41, 48);
        ctx.closePath();
        ctx.fill();

        // Right lighter facet
        ctx.fillStyle = '#f16529';
        ctx.beginPath();
        ctx.moveTo(0, -50);
        ctx.lineTo(41, -50);
        ctx.lineTo(34, 42);
        ctx.lineTo(0, 52);
        ctx.closePath();
        ctx.fill();

        // White '5' glyph
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-28, -36);
        ctx.lineTo(28, -36);
        ctx.lineTo(25, -22);
        ctx.lineTo(-16, -22);
        ctx.lineTo(-12, -6);
        ctx.lineTo(23, -6);
        ctx.lineTo(18, 32);
        ctx.lineTo(0, 39);
        ctx.lineTo(-18, 32);
        ctx.lineTo(-20, 18);
        ctx.lineTo(-9, 18);
        ctx.lineTo(-7, 25);
        ctx.lineTo(0, 27);
        ctx.lineTo(9, 25);
        ctx.lineTo(11, 7);
        ctx.lineTo(-26, 7);
        ctx.closePath();
        ctx.fill();

    } else if (type === 'css') {
        // Official CSS3 Blue Shield with '3'
        ctx.fillStyle = '#264de4';
        ctx.beginPath();
        ctx.moveTo(-50, -56);
        ctx.lineTo(50, -56);
        ctx.lineTo(41, 48);
        ctx.lineTo(0, 60);
        ctx.lineTo(-41, 48);
        ctx.closePath();
        ctx.fill();

        // Right lighter facet
        ctx.fillStyle = '#2965f1';
        ctx.beginPath();
        ctx.moveTo(0, -50);
        ctx.lineTo(41, -50);
        ctx.lineTo(34, 42);
        ctx.lineTo(0, 52);
        ctx.closePath();
        ctx.fill();

        // White '3' glyph
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-28, -36);
        ctx.lineTo(28, -36);
        ctx.lineTo(24, -8);
        ctx.lineTo(0, -8);
        ctx.lineTo(0, 3);
        ctx.lineTo(22, 3);
        ctx.lineTo(18, 32);
        ctx.lineTo(0, 39);
        ctx.lineTo(-18, 32);
        ctx.lineTo(-20, 18);
        ctx.lineTo(-9, 18);
        ctx.lineTo(-7, 25);
        ctx.lineTo(0, 27);
        ctx.lineTo(9, 25);
        ctx.lineTo(11, 14);
        ctx.lineTo(-14, 14);
        ctx.lineTo(-14, -22);
        ctx.lineTo(15, -22);
        ctx.lineTo(17, -29);
        ctx.lineTo(-28, -29);
        ctx.closePath();
        ctx.fill();

    } else if (type === 'go') {
        // Official Go Gopher Blue Cyan Pill with 'GO' lettering
        ctx.fillStyle = '#00add8';
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'italic 900 52px Inter, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GO', 0, 2);

    } else if (type === 'rust') {
        // Official Rust Gear with Letter 'R'
        ctx.fillStyle = '#ce412b';
        ctx.beginPath();
        const teeth = 12;
        const outerR = 52;
        const innerR = 42;
        for (let i = 0; i < teeth * 2; i++) {
            const angle = (Math.PI / teeth) * i;
            const rad = i % 2 === 0 ? outerR : innerR;
            const gx = Math.cos(angle) * rad;
            const gy = Math.sin(angle) * rad;
            if (i === 0) ctx.moveTo(gx, gy);
            else ctx.lineTo(gx, gy);
        }
        ctx.closePath();
        ctx.fill();

        // Inner circle hole
        ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();

        // Rust 'R'
        ctx.fillStyle = '#ce412b';
        ctx.font = '900 38px Inter, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('R', 0, 2);
    }

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
}

const TECH_LOGOS = [
    'python',
    'java',
    'cpp',
    'js',
    'ts',
    'react',
    'html',
    'css',
    'go',
    'rust'
];

export default function ThreeBackgroundCanvas() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let width = container.clientWidth || window.innerWidth;
        let height = container.clientHeight || window.innerHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.z = 24;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0x000000, 0);

        container.appendChild(renderer.domElement);

        const isDark = document.documentElement.classList.contains('dark');

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.5 : 1.9);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(isDark ? 0x818cf8 : 0x6366f1, 1.6);
        dirLight.position.set(10, 20, 15);
        scene.add(dirLight);

        // 1. Floating 2D Tech Icon Badges (Evenly distributed with minimum-distance separation, organic 2D drift)
        const techGroup = new THREE.Group();
        scene.add(techGroup);

        const badgeGeom = new THREE.PlaneGeometry(2.2, 2.2);

        const techMeshes = [];
        const texturesToDispose = [];

        // Poisson-disc / Relaxed dispersion to ensure equal minimum distances
        // without rigid row/column alignment:
        const totalItems = 16;
        const placedPoints = [];
        const minDistance = 9.2; // strict minimum distance between any two icons (prevents clustering)
        const areaWidth = 48;
        const areaHeight = 30;

        for (let i = 0; i < totalItems; i++) {
            let bestX = 0;
            let bestY = 0;
            let found = false;

            // Generate candidates and pick one that respects the minDistance
            for (let attempt = 0; attempt < 80; attempt++) {
                const candX = (Math.random() - 0.5) * areaWidth;
                const candY = (Math.random() - 0.5) * areaHeight;

                let tooClose = false;
                for (const p of placedPoints) {
                    const dist = Math.hypot(candX - p.x, candY - p.y);
                    if (dist < minDistance) {
                        tooClose = true;
                        break;
                    }
                }

                if (!tooClose) {
                    bestX = candX;
                    bestY = candY;
                    found = true;
                    break;
                }
            }

            // Fallback if space is tight: pick point furthest from nearest neighbor
            if (!found) {
                let maxMinDist = -1;
                for (let attempt = 0; attempt < 40; attempt++) {
                    const candX = (Math.random() - 0.5) * areaWidth;
                    const candY = (Math.random() - 0.5) * areaHeight;
                    let nearest = Infinity;
                    for (const p of placedPoints) {
                        const dist = Math.hypot(candX - p.x, candY - p.y);
                        if (dist < nearest) nearest = dist;
                    }
                    if (nearest > maxMinDist) {
                        maxMinDist = nearest;
                        bestX = candX;
                        bestY = candY;
                    }
                }
            }

            placedPoints.push({ x: bestX, y: bestY });

            const logoType = TECH_LOGOS[i % TECH_LOGOS.length];
            const logoTex = drawOfficialLogo(logoType);
            texturesToDispose.push(logoTex);

            const faceMat = new THREE.MeshBasicMaterial({
                map: logoTex,
                transparent: true,
                opacity: isDark ? 0.90 : 0.88
            });

            const mesh = new THREE.Mesh(badgeGeom, faceMat);
            mesh.position.set(bestX, bestY, -1);
            mesh.rotation.set(0, 0, 0); // Strictly flat 2D facing camera

            const speed = {
                baseX: bestX,
                baseY: bestY,
                driftSpeedX: 0.6 + (i % 3) * 0.25,
                driftSpeedY: 0.8 + ((i + 1) % 4) * 0.2,
                driftAmpX: 0.9 + (i % 2) * 0.4,
                driftAmpY: 1.1 + (i % 3) * 0.3,
                phaseOffset: (i * 1.618) * Math.PI // golden-ratio phase offset for organic floating
            };

            techGroup.add(mesh);
            techMeshes.push({ mesh, speed, mat: faceMat });
        }

        // 2. Wave Particle Constellation Backdrop
        const gridX = 32;
        const gridY = 20;
        const totalParticles = gridX * gridY;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(totalParticles * 3);

        const stepX = 54 / gridX;
        const stepY = 44 / gridY;

        let pIdx = 0;
        for (let ix = 0; ix < gridX; ix++) {
            for (let iy = 0; iy < gridY; iy++) {
                const x = (ix - gridX / 2) * stepX;
                const y = (iy - gridY / 2) * stepY;
                positions[pIdx * 3] = x;
                positions[pIdx * 3 + 1] = y;
                positions[pIdx * 3 + 2] = -5;
                pIdx++;
            }
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMat = new THREE.PointsMaterial({
            color: isDark ? 0x6366f1 : 0x4338ca,
            size: isDark ? 0.20 : 0.16,
            transparent: true,
            opacity: isDark ? 0.35 : 0.22
        });

        const particleWave = new THREE.Points(particleGeometry, particleMat);
        scene.add(particleWave);

        // Smooth mouse parallax
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const handleMouseMove = (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.0006;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.0006;
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        // Resize handler
        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth || window.innerWidth;
            const h = container.clientHeight || window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);

        // Theme Mutation Observer
        const observer = new MutationObserver(() => {
            const darkNow = document.documentElement.classList.contains('dark');
            particleMat.color.setHex(darkNow ? 0x6366f1 : 0x4338ca);
            particleMat.opacity = darkNow ? 0.35 : 0.22;
            particleMat.needsUpdate = true;
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        // Animation Loop
        let animId;
        const clock = new THREE.Clock();

        const animate = () => {
            animId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            targetX += (mouseX - targetX) * 0.04;
            targetY += (mouseY - targetY) * 0.04;

            techGroup.position.x = targetX * 3;
            techGroup.position.y = -targetY * 3;

            // Organic 2D floating around the background (flat, no 3D tilting or clustering)
            for (let i = 0; i < techMeshes.length; i++) {
                const { mesh, speed } = techMeshes[i];
                mesh.position.y = speed.baseY + Math.sin(time * speed.driftSpeedY + speed.phaseOffset) * speed.driftAmpY;
                mesh.position.x = speed.baseX + Math.cos(time * speed.driftSpeedX + speed.phaseOffset) * speed.driftAmpX;
            }

            // Subtle undulating particle wave
            const posArray = particleGeometry.attributes.position.array;
            let idx = 0;
            for (let ix = 0; ix < gridX; ix++) {
                for (let iy = 0; iy < gridY; iy++) {
                    const waveZ = Math.sin(ix * 0.35 + time * 1.2) * 0.5 + Math.cos(iy * 0.3 + time * 0.9) * 0.5;
                    posArray[idx * 3 + 2] = -5 + waveZ;
                    idx++;
                }
            }
            particleGeometry.attributes.position.needsUpdate = true;

            camera.position.x = targetX * 2;
            camera.position.y = -targetY * 2;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(animId);
            observer.disconnect();
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);

            if (container && renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }

            badgeGeom.dispose();
            techMeshes.forEach(({ mat }) => mat.dispose());
            texturesToDispose.forEach(t => t.dispose());
            particleGeometry.dispose();
            particleMat.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-transparent"
        />
    );
}
