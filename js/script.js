// AGENT 12: UNIVERSAL SINGULARITY ENGINE
document.addEventListener('DOMContentLoaded', () => {
    loadLegionData();
    initThreeJS();
    initUniversalGravity();
});

async function loadLegionData() {
    try {
        const response = await fetch('data/data.json');
        const data = await response.json();
        const container = document.getElementById('agent-list-container');
        
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
    } catch (e) { console.error("Data Breach: Legion data unreachable."); }
}

function initUniversalGravity() {
    // This targets EVERY element with the 'gravity-item' class
    document.addEventListener('mousemove', (e) => {
        const items = document.querySelectorAll('.gravity-item');
        
        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const distX = e.clientX - centerX;
            const distY = e.clientY - centerY;
            const distance = Math.hypot(distX, distY);

            if (distance < 250) {
                const pull = (250 - distance) / 250;
                gsap.to(item, {
                    x: distX * 0.3 * pull,
                    y: distY * 0.3 * pull,
                    skewX: 10 * pull,
                    scale: 1 + (0.1 * pull),
                    color: "#ffaa00", // Turns gold as it approaches the "event horizon"
                    duration: 0.4,
                    ease: "power2.out"
                });
            } else {
                gsap.to(item, { x: 0, y: 0, skewX: 0, scale: 1, color: "", duration: 0.8 });
            }
        });
    });
}
