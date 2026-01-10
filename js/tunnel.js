// Tunnel Effect inspired by soju22
// Implemented for Plinkoverse

function initTunnel() {
    if (typeof THREE === 'undefined') {
        console.error("Three.js not loaded");
        return;
    }

    // Container setup
    const container = document.createElement('div');
    container.id = 'tunnel-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '-2'; // Behind content, replacing stars
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create Path
    const points = [];
    for (let i = 0; i < 50; i++) {
        const t = i / 5 * Math.PI * 2;
        const x = Math.sin(t) * 10;
        const y = Math.cos(t * 1.5) * 10;
        const z = Math.sin(t * 2) * 10;
        points.push(new THREE.Vector3(x, y, z));
    }
    const path = new THREE.CatmullRomCurve3(points);
    path.closed = true;

    // Tube Geometry
    // tubularSegments, radius, radialSegments, closed
    const tubeGeo = new THREE.TubeGeometry(path, 200, 2, 8, true);
    
    // Wireframe Effect
    const edges = new THREE.EdgesGeometry(tubeGeo);
    const lineMat = new THREE.LineBasicMaterial({ 
        color: 0x00d2ff, 
        transparent: true, 
        opacity: 0.4,
        linewidth: 1
    });
    const tube = new THREE.LineSegments(edges, lineMat);
    scene.add(tube);

    // Particles (Stars inside tunnel)
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    
    for(let i=0; i<particleCount; i++) {
        const t = Math.random(); // Position along path
        const point = path.getPoint(t);
        // Add randomness around the point
        const spread = 5;
        point.x += (Math.random() - 0.5) * spread;
        point.y += (Math.random() - 0.5) * spread;
        point.z += (Math.random() - 0.5) * spread;
        
        pPos[i*3] = point.x;
        pPos[i*3+1] = point.y;
        pPos[i*3+2] = point.z;
    }
    
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particleMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.8
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Animation variables
    let progress = 0;
    const speed = 0.0005;
    
    // Mouse interaction
    let mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animate() {
        requestAnimationFrame(animate);

        // Move camera along path
        progress += speed;
        if (progress > 1) progress = 0;

        const pos = path.getPointAt(progress);
        const lookAt = path.getPointAt((progress + 0.01) % 1);

        camera.position.copy(pos);
        camera.lookAt(lookAt);
        
        // Add mouse influence to camera rotation (look around)
        camera.rotateX(-mouse.y * 0.5);
        camera.rotateY(-mouse.x * 0.5);

        // Rotate tube for dynamic effect
        tube.rotation.z += 0.001;
        particles.rotation.z -= 0.0005;

        // Dynamic color pulse
        const time = Date.now() * 0.001;
        const hue = (time * 0.1) % 1;
        // Keep it in blue/cyan/purple range
        // lineMat.color.setHSL(0.5 + Math.sin(time)*0.1, 1, 0.5); 

        renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Auto-init if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTunnel);
} else {
    initTunnel();
}
