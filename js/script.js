let isConnected = false;
let loyaltyScore = parseFloat(localStorage.getItem('plink_loyalty')) || 1.0;

// 1. Fetch Agents from JSON
async function loadLegion() {
    const response = await fetch('data.json');
    const data = await response.json();
    const list = document.getElementById('agent-list-container');
    
    data.agents.forEach(agent => {
        const row = document.createElement('div');
        row.className = 'agent-row gravity-item';
        row.innerHTML = `
            <span style="color:var(--plink); margin-right:20px;">${agent.id}</span>
            <span style="font-weight:900; font-size:1.5rem;">${agent.name}</span>
            <span style="margin-left:auto; opacity:0.5; font-style:italic;">"${agent.vow}"</span>
        `;
        list.appendChild(row);
    });
    initGravity(); // Apply black hole to new items
}

// 2. Universal Gravity Engine
function initGravity() {
    const targets = document.querySelectorAll('.gravity-item');
    
    document.addEventListener('mousemove', (e) => {
        targets.forEach(el => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distX = e.clientX - centerX;
            const distY = e.clientY - centerY;
            const distance = Math.hypot(distX, distY);

            if (distance < 200) {
                const pull = (200 - distance) / 200;
                gsap.to(el, {
                    x: distX * 0.4 * pull,
                    y: distY * 0.4 * pull,
                    rotation: 45 * pull,
                    scale: 1 - (0.2 * pull),
                    duration: 0.3
                });
            } else {
                gsap.to(el, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.6 });
            }
        });
    });
}

// 3. Social Share
function shareStreak() {
    const text = `I am anchoring the 2026 Bankroll. My Loyalty Multiplier is ${loyaltyScore.toFixed(4)}x at plinkofaucet.com #PLIK46`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
}

// Start everything
window.onload = () => {
    loadLegion();
    // ... existing Three.js and Wallet code ...
};
