// SPAR PANA PROTOCOL - FAUCET LOGIC v3.8
const claimBtn = document.getElementById('claim-btn');
const trigger = document.getElementById('claim-trigger');
const balanceEl = document.getElementById('user-balance');

// 1. MAGNETIC EFFECT (The Black Hole Pull)
document.addEventListener('mousemove', (e) => {
    const rect = trigger.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const distance = Math.hypot(x, y);

    if (distance < 150) {
        // Pull the button toward the cursor
        gsap.to(claimBtn, {
            x: x * 0.5,
            y: y * 0.5,
            duration: 0.3,
            ease: "power2.out"
        });
    } else {
        // Return to center
        gsap.to(claimBtn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
    }
});

// 2. CLAIM LOGIC (Off-Chain Manifestation)
claimBtn.addEventListener('click', () => {
    const now = Date.now();
    const lastClaim = localStorage.getItem('last_plik_claim') || 0;
    const cooldown = 24 * 60 * 60 * 1000; // 24 Hours

    if (now - lastClaim < cooldown) {
        alert("The Singularity is recharging. Come back in " + 
              Math.round((cooldown - (now - lastClaim)) / 3600000) + " hours.");
        return;
    }

    // Success State
    document.getElementById('claim-sound').play();
    let currentBal = parseFloat(localStorage.getItem('plik_balance')) || 0;
    currentBal += 46.00; // Reward amount
    
    localStorage.setItem('plik_balance', currentBal);
    localStorage.setItem('last_plik_claim', now);
    
    balanceEl.innerText = currentBal.toFixed(4);
    
    // Animate the button "imploding" on success
    gsap.to(claimBtn, { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 });
    alert("46 [PLIK] ANCHORED TO YOUR SESSION.");
});

// Initialize Balance on load
window.onload = () => {
    const savedBal = localStorage.getItem('plik_balance') || "0.0000";
    balanceEl.innerText = parseFloat(savedBal).toFixed(4);
};
