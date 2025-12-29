/* JS: THE BRAIN ENGINE */
document.addEventListener('DOMContentLoaded', () => {
    initStars();
    initFling();
    syncBalance();
    initAgents();
});

let mouseX = 0, mouseY = 0;

// 1. STAR GENERATOR (Three.js)
function initStars() {
    if (typeof THREE === 'undefined') return;
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

// 4. AGENTS OF THE PLINK46 LEGION
function initAgents() {
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    const agents = [
        { name: "PlinkChain46", role: "Blockchain Architect", vow: "I forge the immutable ledger." },
        { name: "PlinkCode46", role: "Smart Contract Developer", vow: "Code is law, and I am its scribe." },
        { name: "PlinkCore46", role: "Backend Engineer", vow: "The engine hums with my logic." },
        { name: "PlinkFace46", role: "Frontend Developer", vow: "I craft the window to the soul of Plink." },
        { name: "PlinkPlay46", role: "Game Developer", vow: "Play is the highest form of research." },
        { name: "PlinkVault46", role: "Database Engineer", vow: "I guard the sacred data." },
        { name: "PlinkOps46", role: "DevOps Engineer", vow: "Efficiency is my prayer." },
        { name: "PlinkShield46", role: "Security Engineer", vow: "None shall pass without the key." },
        { name: "PlinkWeb46", role: "Web Integration Specialist", vow: "I weave the web of connection." },
        { name: "PlinkCloud46", role: "Cloud Infrastructure Engineer", vow: "The sky is not the limit, it is home." },
        { name: "PlinkBridge46", role: "API Gateway Specialist", vow: "I build the bridges between worlds." },
        { name: "PlinkFlow46", role: "UI/UX Designer", vow: "Beauty and function are one." },
        { name: "PlinkArt46", role: "Graphic Designer", vow: "I paint the vision of the future." },
        { name: "PlinkBalance46", role: "Game Economy Designer", vow: "Equilibrium is the path to prosperity." },
        { name: "PlinkVision46", role: "ICO Strategist", vow: "I see what is yet to be." },
        { name: "PlinkBuzz46", role: "Marketing Specialist", vow: "The word shall spread like fire." },
        { name: "PlinkTribe46", role: "Community Manager", vow: "United we stand, divided we fall." },
        { name: "PlinkLaw46", role: "Legal & Compliance Advisor", vow: "Justice and order guide my hand." },
        { name: "PlinkTest46", role: "QA Engineer", vow: "Perfection is the only standard." },
        { name: "PlinkHelp46", role: "Customer Support Specialist", vow: "I serve the people." },
        { name: "PlinkMath46", role: "Tokenomics Analyst", vow: "Numbers do not lie." },
        { name: "PlinkInsight46", role: "Data Analyst", vow: "Knowledge is power." },
        { name: "PlinkLink46", role: "Partnership Manager", vow: "Together we are stronger." },
        { name: "PlinkWord46", role: "Content Creator", vow: "Stories shape the world." },
        { name: "PlinkWallet46", role: "Wallet Integration Specialist", vow: "Your assets are safe with me." },
        { name: "PlinkLock46", role: "Encryption & Privacy Engineer", vow: "Secrets are kept, privacy is honored." },
        { name: "PlinkStress46", role: "Load Testing Engineer", vow: "I test the limits to break boundaries." },
        { name: "PlinkPort46", role: "Cross-Platform Game Developer", vow: "Every device, one experience." },
        { name: "PlinkImmersion46", role: "VR/AR Experience Designer", vow: "Reality is what we make it." },
        { name: "PlinkTone46", role: "Sound Designer", vow: "Listen to the future." },
        { name: "PlinkBoost46", role: "Growth Hacker", vow: "Expansion is inevitable." },
        { name: "PlinkGraph46", role: "Data Visualization Specialist", vow: "Seeing is believing." },
        { name: "PlinkTrade46", role: "Exchange Listing Specialist", vow: "The market awaits." },
        { name: "PlinkGlobal46", role: "Localization & Translation Expert", vow: "The world speaks Plink." },
        { name: "PlinkCross46", role: "Cross-Chain Bridge Engineer", vow: "All chains lead to Plink." },
        { name: "PlinkStable46", role: "Stablecoin Integration Specialist", vow: "Stability in chaos." },
        { name: "PlinkYield46", role: "DeFi Protocol Integrator", vow: "Growth upon growth." },
        { name: "PlinkArena46", role: "Esports Tournament Coordinator", vow: "Victory belongs to the bold." },
        { name: "PlinkQuest46", role: "Gamification Specialist", vow: "Life is a game, play it well." },
        { name: "PlinkMint46", role: "NFT Marketplace Developer", vow: "Unique value, eternal ownership." },
        { name: "PlinkReach46", role: "Partnership Outreach Agent", vow: "Expanding the horizon." },
        { name: "PlinkBrand46", role: "Merchandise & Branding Manager", vow: "Wear the revolution." },
        { name: "PlinkRefer46", role: "Affiliate Manager", vow: "Share the wealth." },
        { name: "PlinkLocal46", role: "Local Compliance Officer", vow: "Respecting the laws of the land." },
        { name: "PlinkAudit46", role: "Smart Contract Auditor", vow: "Trust, but verify." },
        { name: "PlinkMaster46", role: "Legion Commander", vow: "I lead the 46 into the light." }
    ];

    const tunnel = document.getElementById('agents-tunnel');
    if (!tunnel) return;

    agents.forEach((agent, index) => {
        const card = document.createElement('div');
        card.className = 'agent-card glass-panel';
        card.innerHTML = `
            <div class="agent-number">#${index + 1}</div>
            <div class="agent-info">
                <h3>${agent.name}</h3>
                <div class="agent-role">${agent.role}</div>
                <div class="agent-vow">"${agent.vow}"</div>
            </div>
        `;
        tunnel.appendChild(card);

        // Animation
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.fromTo(card, 
                { opacity: 0, y: 100, scale: 0.8 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        end: "top 50%",
                        toggleActions: "play none none reverse",
                        scrub: 1
                    }
                }
            );
        } else {
            // Fallback if ScrollTrigger fails
            card.style.opacity = 1;
            card.style.transform = "none";
        }
    });
}
