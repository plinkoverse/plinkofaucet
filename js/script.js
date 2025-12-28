// SPAR PANA - SCRIPT.JS v3.9.1
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('agent-list-container')) loadLegionData();
    syncTokenomics();
    initUniversalGravity();
    if (typeof initThreeJS === "function") initThreeJS();
    
    // Resume streak if connected
    if(localStorage.getItem('plink_loyalty')) {
        startLoyaltyPulse();
    }
});

async function loadLegionData() {
    try {
        const response = await fetch('data/data.json');
        const data = await response.json();
        const container = document.getElementById('agent-list-container');
        if (!container) return;

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
    } catch (e) { console.error("Legion Offline."); }
}

async function syncTokenomics() {
    try {
        const response = await fetch('data/ico.json');
        const ico = await response.json();
        const supplyEl = document.querySelector('.total-supply-display');
        const fundingEl = document.querySelector('.funding-progress-text');

        if(supplyEl) supplyEl.innerText = `[PLIK] TOTAL SUPPLY: ${Number(ico.total_supply).toLocaleString()}`;
        if(fundingEl) fundingEl.innerText = `PHASE 1: $${ico.funding_goals.current_raised_usd} / $${ico.funding_goals.solidity_manifestation}`;
    } catch (e) { console.warn("Sync Failed."); }
}

function initUniversalGravity() {
    document.addEventListener('mousemove', (e) => {
        const items = document.querySelectorAll('.gravity-item');
        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

            if (distance < 250) {
                const pull = (250 - distance) / 250;
                gsap.to(item, {
                    x: (e.clientX - centerX) * 0.3 * pull,
                    y: (e.clientY - centerY) * 0.3 * pull,
                    scale: 1 + (0.1 * pull),
                    color: "#ffaa00",
                    duration: 0.4
                });
            } else {
                gsap.to(item, { x: 0, y: 0, scale: 1, color: "", duration: 0.8 });
            }
        });
    });
}
