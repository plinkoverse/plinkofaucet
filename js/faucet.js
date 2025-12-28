// SPAR PANA - FAUCET.JS v3.9.1
const claimBtn = document.getElementById('claim-btn');
const balanceEl = document.getElementById('user-balance');

if (claimBtn) {
    claimBtn.addEventListener('click', () => {
        const now = Date.now();
        const lastClaim = localStorage.getItem('last_plik_claim') || 0;
        const cooldown = 24 * 60 * 60 * 1000;

        if (now - lastClaim < cooldown) {
            alert("Singularity Recharging.");
            return;
        }

        let currentBal = parseFloat(localStorage.getItem('plik_balance')) || 0;
        currentBal += 46.00;
        localStorage.setItem('plik_balance', currentBal);
        localStorage.setItem('last_plik_claim', now);
        
        if (balanceEl) balanceEl.innerText = currentBal.toFixed(4);
        alert("46 [PLIK] ANCHORED.");
    });
}

// Global update for balance display across all pages
window.addEventListener('load', () => {
    const savedBal = localStorage.getItem('plik_balance') || "0.0000";
    if (balanceEl) balanceEl.innerText = parseFloat(savedBal).toFixed(4);
});
