/* JS: THE BRAIN ENGINE */
document.addEventListener('DOMContentLoaded', () => {
    initStars();
    initFling();
    syncBalance();
});

let mouseX = 0, mouseY = 0;

// 1. STAR GENERATOR (Three.js)
function initStars() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true }); // Alpha true makes it see-through
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(3000 * 3);
    for(let i=0; i<3000*3; i++) starPos[i] = (Math.random() - 0.5) * 100;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    camera.position.z = 15;

    function animate() {
        requestAnimationFrame(animate);
        stars.rotation.y += 0.0005;
        stars.position.x += (mouseX * 5 - stars.position.x) * 0.02;
        stars.position.y += (-mouseY * 5 - stars.position.y) * 0.02;
        renderer.render(scene, camera);
    }
    animate();
}

// 2. TEXT FLING INTERACTION
function initFling() {
    document.querySelectorAll('.fling-text').forEach(p => {
        p.innerHTML = p.innerText.split('').map(c => c===' ' ? ' ' : `<span class="char">${c}</span>`).join('');
    });
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5);
        mouseY = (e.clientY / window.innerHeight - 0.5);
        document.querySelectorAll('.char').forEach(char => {
            const r = char.getBoundingClientRect();
            const d = Math.hypot(e.clientX - (r.left + r.width/2), e.clientY - (r.top + r.height/2));
            if (d < 60) {
                const a = Math.atan2(e.clientY - (r.top + r.height/2), e.clientX - (r.left + r.width/2));
                gsap.to(char, { x: Math.cos(a)*-50, y: Math.sin(a)*-50, duration: 0.3 });
            } else {
                gsap.to(char, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
            }
        });
    });
}

// 3. BALANCE SYNC
function syncBalance() {
    const bal = localStorage.getItem('plik_balance') || "0.0000";
    const display = document.getElementById('user-balance');
    if (display) display.innerText = parseFloat(bal).toFixed(4);
}
