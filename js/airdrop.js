// AIRDROP LOGIC v1.0 - SPAR PANA
document.addEventListener('DOMContentLoaded', () => {
    const checkBtn = document.getElementById('check-eligibility');
    const streak = parseInt(localStorage.getItem('plink_streak')) || 0;
    const balance = parseFloat(localStorage.getItem('plik_balance')) || 0;

    document.getElementById('display-streak').innerText = streak;
    document.getElementById('display-balance').innerText = balance.toFixed(2);

    checkBtn.addEventListener('click', () => {
        const statusDiv = document.getElementById('airdrop-status');
        const badge = document.getElementById('rank-badge');
        const rankText = document.getElementById('user-rank');
        statusDiv.style.display = "block";

        let rank = "GLITCHED";
        let color = "#888";

        if (streak >= 46) {
            rank = "SPARPANA ELITE";
            color = "#ffaa00"; // Gold
        } else if (streak >= 20) {
            rank = "SINGULARITY";
            color = "#00ffcc"; // Plink Green
        } else if (streak >= 5) {
            rank = "SATELLITE";
            color = "#00d2ff"; // Blue
        }

        // Animate Rank Reveal
        rankText.innerText = rank;
        badge.innerText = rank[0];
        badge.style.borderColor = color;
        badge.style.color = color;
        badge.className = "badge-active";

        document.getElementById('status-msg').innerHTML = 
            `LOYALTY CONFIRMED.<br>You are eligible for the <b>${rank}</b> tier drop.`;
        
        gsap.from(".airdrop-card", { scale: 0.9, duration: 0.5, ease: "bounce.out" });
    });
});
