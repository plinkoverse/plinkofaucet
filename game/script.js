// PLINKOVERSE GAME ENGINE
const canvas = document.getElementById('plinko-board');
const ctx = canvas.getContext('2d');

// Game Config
const ROWS = 12;
const PEG_RADIUS = 3;
const BALL_RADIUS = 5;
const GRAVITY = 0.2;
const FRICTION = 0.5; // High friction for air resistance feel
const BOUNCE = 0.6;

// State
let bankroll = 23000000.00;
let balance = 0.00;
let balls = [];
let pegs = [];
let buckets = [];
let width, height;

// Multipliers (Simple curve: High edges, low center)
const MULTIPLIERS = [10, 5, 2, 1, 0.5, 0.2, 0.2, 0.2, 0.5, 1, 2, 5, 10];
// Ensure buckets match rows logic (Rows + 1 buckets usually)
// For 12 rows, we need ~13 buckets. 
// Let's dynamic gen multipliers or stick to this list and adjust rows.
// 12 rows -> 13 spaces at bottom.
// List above has 13 items. Perfect.

// Init
window.onload = () => {
    resize();
    loadState();
    initBoard();
    loop();
};

window.onresize = resize;

function resize() {
    width = window.innerWidth > 500 ? 500 : window.innerWidth - 20; // Max width 500
    height = window.innerHeight > 700 ? 700 : window.innerHeight - 40;
    canvas.width = width;
    canvas.height = height;
    initBoard();
}

function loadState() {
    const savedBal = localStorage.getItem('plik_balance');
    balance = savedBal ? parseFloat(savedBal) : 0.00;
    
    const savedBank = localStorage.getItem('plink_bankroll');
    bankroll = savedBank ? parseFloat(savedBank) : 23000000.00;
    
    updateUI();
}

function saveState() {
    localStorage.setItem('plik_balance', balance.toFixed(4));
    localStorage.setItem('plink_bankroll', bankroll.toFixed(4));
    updateUI();
}

function updateUI() {
    document.getElementById('player-balance').innerText = balance.toFixed(2);
    document.getElementById('bankroll-display').innerText = bankroll.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function initBoard() {
    pegs = [];
    buckets = [];
    
    const padding = 20;
    const availableWidth = width - (padding * 2);
    const spacing = availableWidth / ROWS; // Space between pegs
    
    // Create Pegs (Pyramid)
    // Actually standard plinko is rectangular grid with offset, or pyramid.
    // Pyramid: Row 3 has 3 pegs, Row 4 has 4...
    // Let's do pyramid for classic look.
    
    const startY = 100;
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c <= r; c++) {
            // Center the row
            const x = (width / 2) - ((r * spacing) / 2) + (c * spacing);
            const y = startY + (r * spacing);
            pegs.push({ x, y });
        }
    }
    
    // Create Buckets at bottom
    // The last row (ROWS-1) has ROWS pegs.
    // The balls fall BETWEEN these pegs (and outside).
    // So we have ROWS + 1 zones.
    // Wait, Pyramid: Row 0 = 1 peg. Row 1 = 2 pegs. ... Row 11 = 12 pegs.
    // Balls fall to the sides of pegs. 
    // At bottom of Row 11, there are 12 pegs, creating 13 gaps?
    // Let's visualize: 
    //   *
    //  * *
    // * * *
    // Gap count = Row Index + 1 ? No.
    // If Row 0 (1 peg), ball goes Left or Right (2 outcomes).
    // Row 1 (2 pegs), ball can end up in 3 spots?
    // Yes. So for ROWS=12 (0-11), final row has 12 pegs.
    // Outcomes = 13.
    // My MULTIPLIERS list has 13 items. Correct.
    
    const finalRowY = startY + ((ROWS - 1) * spacing);
    const bucketY = finalRowY + spacing; // Where buckets are
    
    // Buckets are zones.
    // X coords for buckets correspond to the gaps of the last row.
    // Last row X start: (width/2) - ((11 * spacing)/2)
    // First bucket center is to the left of first peg?
    // Let's just define bucket zones based on x coordinates.
    
    const lastRowWidth = (ROWS - 1) * spacing;
    const startX = (width / 2) - (lastRowWidth / 2); // Center of first peg of last row
    
    // We need 13 buckets. 
    // 1st bucket is Left of first peg.
    // 2nd bucket is Between 1st and 2nd peg.
    // ...
    // 13th bucket is Right of last peg.
    
    for(let i=0; i < ROWS + 1; i++) {
        // Center of bucket i
        // First peg is at startX.
        // Bucket 0 center should be startX - (spacing/2).
        const cx = startX - (spacing/2) + (i * spacing);
        const cy = bucketY;
        const w = spacing - 4;
        const h = 40;
        
        buckets.push({
            x: cx, y: cy, w, h,
            val: MULTIPLIERS[i] || 1,
            color: getBucketColor(MULTIPLIERS[i])
        });
    }
}

function getBucketColor(mult) {
    if(mult >= 10) return '#ff0055'; // High risk/reward
    if(mult >= 2) return '#ffaa00';
    if(mult >= 1) return '#00d2ff';
    return '#333'; // Loss
}

// Game Loop
function loop() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw Pegs
    ctx.fillStyle = '#fff';
    pegs.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PEG_RADIUS, 0, Math.PI*2);
        ctx.fill();
    });
    
    // Draw Buckets
    buckets.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x - b.w/2, b.y, b.w, b.h);
        
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(b.val + 'x', b.x, b.y + 25);
    });
    
    // Update & Draw Balls
    for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        
        // Physics
        b.vy += GRAVITY;
        b.x += b.vx;
        b.y += b.vy;
        
        // Peg Collision
        pegs.forEach(p => {
            const dx = b.x - p.x;
            const dy = b.y - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < BALL_RADIUS + PEG_RADIUS) {
                // Bounce
                // Simple deflection: normalized vector
                const nx = dx / dist;
                const ny = dy / dist;
                
                // Reflect velocity? 
                // Simplified: Add horizontal push based on impact x
                // And dampen Y
                
                // Add some randomness (The "Chaos" of Plinko)
                const jitter = (Math.random() - 0.5) * 2;
                
                b.vx += nx * 2 + jitter;
                b.vy *= -BOUNCE;
                
                // Push out to prevent sticking
                const overlap = (BALL_RADIUS + PEG_RADIUS) - dist;
                b.x += nx * overlap;
                b.y += ny * overlap;
            }
        });
        
        // Draw Ball
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_RADIUS, 0, Math.PI*2);
        ctx.fillStyle = '#00d2ff';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        
        // Bucket Collision (Check if reached bottom)
        // Check Y threshold
        if (b.y > buckets[0].y) {
            // Find which bucket
            const landedBucket = buckets.find(bucket => Math.abs(b.x - bucket.x) < bucket.w/2 + 5);
            
            if (landedBucket) {
                resolveBall(b, landedBucket);
                balls.splice(i, 1);
            } else if (b.y > height) {
                 // Missed everything (shouldn't happen with correct bounds)
                 balls.splice(i, 1);
            }
        }
    }
    
    requestAnimationFrame(loop);
}

function dropBall() {
    const betInput = document.getElementById('bet-amount');
    const bet = parseFloat(betInput.value);
    
    if (isNaN(bet) || bet <= 0) {
        log("Invalid bet amount.");
        return;
    }
    
    if (balance < bet) {
        log("Insufficient funds.");
        return;
    }
    
    // Deduct Balance immediately
    balance -= bet;
    
    // Add to Bankroll temporarily (User "buys" the drop)
    // Actually, prompt says: "if not win, amount goes to bankroll".
    // So we assume it's in the bankroll until they win it back?
    // Or we hold it in limbo?
    // "everytime someone drops... that amount goes into the bankroll"
    bankroll += bet; 
    
    saveState();
    
    // Spawn Ball
    // Randomize start X slightly to create variance
    const startX = width / 2 + (Math.random() - 0.5) * 10;
    
    balls.push({
        x: startX,
        y: 50,
        vx: 0,
        vy: 0,
        bet: bet
    });
    
    log(`Dropped ${bet} [PLIK]...`);
}

function resolveBall(ball, bucket) {
    const winAmount = ball.bet * bucket.val;
    
    // Bankroll Logic
    // If Win (mult > 0), money leaves bankroll.
    // We already added the 'bet' to the bankroll on drop.
    // So now we subtract the 'winAmount' from bankroll.
    
    bankroll -= winAmount;
    balance += winAmount;
    
    saveState();
    
    if (bucket.val >= 1) {
        log(`WON ${winAmount.toFixed(2)} [PLIK] (${bucket.val}x)!`);
    } else {
        log(`Lost... (${bucket.val}x)`);
    }
}

function log(msg) {
    const el = document.getElementById('msg-log');
    el.innerText = msg;
    el.style.opacity = 1;
    setTimeout(() => el.style.opacity = 0, 2000);
}

document.getElementById('drop-btn').addEventListener('click', dropBall);
