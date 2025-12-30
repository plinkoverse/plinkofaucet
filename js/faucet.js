// SPAR PANA - FAUCET & RECEIPT ENGINE v4.2
const claimBtn = document.getElementById('claim-btn');
const balanceEl = document.getElementById('user-balance');
const statusMsg = document.getElementById('cooldown-timer');

// 1. Initialize Balance on Load
window.addEventListener('load', () => {
    updateDisplay();
    checkCooldown();
});

function updateDisplay() {
    const savedBal = localStorage.getItem('plik_balance') || "0.0000";
    if (balanceEl) balanceEl.innerText = parseFloat(savedBal).toFixed(4);
}

// 2. The Extraction Logic
if (claimBtn) {
    claimBtn.addEventListener('click', () => {
        // 1. LOGIN CHECK
        const user = localStorage.getItem('plink_user');
        if (!user) {
            alert("ACCESS DENIED: Please Login / Join the 46 Legion to extract resources.");
            document.querySelector('.open-auth')?.click(); // Trigger login modal if possible
            return;
        }

        const now = Date.now();
        const lastClaim = localStorage.getItem('last_plik_claim') || 0;
        const cooldown = 24 * 60 * 60 * 1000; // 24 Hours

        if (now - lastClaim < cooldown) {
            const remaining = Math.ceil((cooldown - (now - lastClaim)) / 3600000);
            alert(`The Singularity is recharging. Access granted in ${remaining} hours.`);
            return;
        }

        // EXECUTE CLAIM
        let currentBal = parseFloat(localStorage.getItem('plik_balance')) || 0;
        let streak = parseInt(localStorage.getItem('plink_streak')) || 0;
        
        const claimAmount = 4.60;
        currentBal += claimAmount;
        streak += 1;

        // BANKROLL UPDATE (Simulated Global State)
        let bankroll = parseFloat(localStorage.getItem('plink_bankroll'));
        if (isNaN(bankroll)) bankroll = 23000000.00; // Init if missing
        
        // "Claim reflects in remaining supply"
        // Subtract claim from bankroll/supply
        bankroll -= claimAmount;
        localStorage.setItem('plink_bankroll', bankroll.toFixed(4));
        
        // GENERATE UNIQUE RECEIPT HASH (The "Vapor-Token" Proof)
        const receiptHash = generateReceipt(streak);

        // SAVE DATA
        localStorage.setItem('plik_balance', currentBal);
        localStorage.setItem('last_plik_claim', now);
        localStorage.setItem('plink_streak', streak);
        localStorage.setItem('last_receipt', receiptHash);

        // VISUAL FEEDBACK
        updateDisplay();
        showReceipt(receiptHash);
        
        if(statusMsg) statusMsg.innerText = "UPLINK SUCCESSFUL";
        
        // Success Sound
        const snd = document.getElementById('claim-sound');
        if(snd) snd.play();
    });
}

// 3. Cryptographic Receipt Generator
function generateReceipt(streak) {
    const entropy = Math.random().toString(36).substring(7).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    return `PLIK-${streak}-${timestamp}-${entropy}`;
}

// 4. Show the Receipt UI
function showReceipt(hash) {
    const alertBox = document.createElement('div');
    alertBox.style = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.95); border: 1px solid var(--plink);
        padding: 30px; z-index: 1000; text-align: center; color: white;
        backdrop-filter: blur(10px); box-shadow: 0 0 50px rgba(0,255,204,0.3);
    `;
    alertBox.innerHTML = `
        <h3 style="color:var(--plink)">EXTRACTION COMPLETE</h3>
        <p style="font-size:0.8rem; margin:15px 0;">MANIFESTATION HASH:</p>
        <code style="background:#111; padding:10px; display:block; margin-bottom:20px; border:1px solid #333;">${hash}</code>
        <p style="font-size:0.7rem; color:#888;">Save this hash. It is your anchor for the 2026 swap.</p>
        <button onclick="this.parentElement.remove()" style="background:var(--plink); border:none; padding:10px 20px; cursor:pointer; font-weight:bold;">CONFIRM</button>
    `;
    document.body.appendChild(alertBox);
}

function checkCooldown() {
    const lastClaim = localStorage.getItem('last_plik_claim') || 0;
    const cooldown = 24 * 60 * 60 * 1000;
    if (Date.now() - lastClaim < cooldown && statusMsg) {
        statusMsg.innerText = "COOLDOWN ACTIVE";
        statusMsg.style.color = "#ff4500";
    }
}
