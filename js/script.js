/** * SPAR PANA - PLINKOVERSE v4.0 
 * Unified Gravity & Parallax Engine 
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Sub-Systems
    initLusionEngine();
    syncTokenomics();
    loadLegionData();
    
    // 2. Three.js Background (if script exists)
    if (typeof initThreeJS === "function") initThreeJS();
});

/**
 * CORE ENGINE: Combines Background Parallax and Foreground Gravity
 */
function initLusionEngine() {
    const bg = document.getElementById('deep-space-bg');
    
    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // A. BACKGROUND PARALLAX (Movement opposite to mouse)
        if (bg) {
            const moveX = (clientX - centerX) * 0.05; 
            const moveY = (clientY - centerY) * 0.05;
            
            gsap.to(bg, {
                x: moveX,
                y: moveY,
                duration: 1.2,
                ease: "power2.out"
            });
        }

        // B. GRAVITY ITEMS (Attraction/Hover Effect)
        const items = document.querySelectorAll('.gravity-item');
        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const elCenterX = rect.left + rect.width / 2;
            const elCenterY = rect.top + rect.height / 2;
            
            const distX = clientX - elCenterX;
            const distY = clientY - elCenterY;
            const distance = Math.hypot(distX, distY);

            if (distance < 300) {
                const pull = (300 - distance) / 300;
                gsap.to(item, {
                    x: distX * 0.4 * pull,
                    y: distY * 0.4 * pull,
                    scale: 1 + (0.15 * pull),
                    color: "#ffaa00", // Gold highlight
                    textShadow: `0 0 ${25 * pull}px rgba(255, 170, 0, 0.5)`,
                    duration: 0.5,
                    ease: "power2.out"
                });
            } else {
                gsap.to(item, { 
                    x: 0, y: 0, scale: 1, 
                    color: "", 
                    textShadow: "0 0 0px transparent",
                    duration: 0.8 
                });
            }
        });
    });
}

/**
 * DATA LAYER: Pulls 2026 Tokenomics from ico.json
 */
async function syncTokenomics() {
    try {
        const response = await fetch('data/ico.json');
        if (!response.ok) return;
        const ico = await response.json();
        
        const supplyEl = document.querySelector('.total-supply-display');
        const fundingEl = document.querySelector('.funding-progress-text');

        if(supplyEl) {
            supplyEl.innerText = `[PLIK] TOTAL SUPPLY: ${Number(ico.total_supply).toLocaleString()}`;
        }
        if(fundingEl) {
            fundingEl.innerText = `PHASE 1 FUNDING: $${ico.funding_goals.current_raised_usd} / $${ico.funding_goals.solidity_manifestation}`;
        }
    } catch (err) {
        console.warn("Audit: Tokenomic data in shadow.");
    }
}

/**
 * REGISTRY LAYER: Pulls Agents from data.json
 */
async function loadLegionData() {
    try {
        const container = document.getElementById('agent-list-container');
        if (!container) return;

        const response = await fetch('data/data.json');
        const data = await response.json();

        data.agents.forEach(agent => {
            const row = document.createElement('div');
            row.className = 'agent-row gravity-item';
            row.innerHTML = `
                <span class="agent-number">${agent.id}</span>
                <span class="agent-name">${agent.name}</span>
                <span class="agent-vow">${agent.vow}</span>
            `;
            container.appendChild(row);
        });
    } catch (err) {
        console.error("Audit: Legion registry unreachable.");
    }
}
