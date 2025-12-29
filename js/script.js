// This runs as soon as the page is finished loading
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();      // Start the stars
    initTextFling();    // Start the text animation
    initParallax();     // Start the background drift
});

let mouseX = 0, mouseY = 0;

// --- 1. THE STARFIELD ENGINE ---
function initThreeJS() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    
    // We make the star-layer transparent so we can see the image behind it
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create 4,000 stars
    const starCount = 4000;
    const starPos = new Float32Array(starCount * 3);
    for(let i=0; i < starCount * 3; i++) {
        starPos[i] = (Math.random() - 0.5) * 100;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
    
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    camera.position.z = 10;

    // The loop that makes stars move
    function animate() {
        requestAnimationFrame(animate);
        stars.rotation.y += 0.0003; // Slow spin
        // Make stars lean toward the mouse
        stars.position.x += (mouseX * 4 - stars.position.x) * 0.02;
        stars.position.y += (-mouseY * 4 - stars.position.y) * 0.02;
        renderer.render(scene, camera);
    }
    animate();
}

// --- 2. THE INTERACTION ENGINE ---
function initParallax() {
    const bg = document.getElementById('deep-space-bg');
    
    document.addEventListener('mousemove', (e) => {
        // Track mouse position
        mouseX = (e.clientX / window.innerWidth - 0.5);
        mouseY = (e.clientY / window.innerHeight - 0.5);

        // Move the faded background image slightly (Parallax)
        gsap.to(bg, { x: mouseX * -30, y: mouseY * -30, duration: 1 });
    });
}

// --- 3. THE TEXT FLING ENGINE ---
function initTextFling() {
    // This breaks every letter into its own piece so we can move them
    document.querySelectorAll('.fling-text').forEach(p => {
        p.innerHTML = p.innerText.split('').map(char => 
            char === ' ' ? ' ' : `<span class="char">${char}</span>`
        ).join('');
    });

    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.char').forEach(char => {
            const rect = char.getBoundingClientRect();
            // Calculate distance between mouse and the letter
            const dist = Math.hypot(e.clientX - (rect.left + rect.width/2), e.clientY - (rect.top + rect.height/2));
            
            if (dist < 60) {
                // If mouse is close, fling the letter away
                const angle = Math.atan2(e.clientY - (rect.top + rect.height/2), e.clientX - (rect.left + rect.width/2));
                gsap.to(char, { x: Math.cos(angle)*-40, y: Math.sin(angle)*-40, rotation: Math.random()*20-10, duration: 0.2 });
            } else {
                // Return letter to original spot
                gsap.to(char, { x: 0, y: 0, rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
            }
        });
    });
}
