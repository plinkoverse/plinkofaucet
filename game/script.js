// PLINKOVERSE GAME ENGINE
const canvas = document.getElementById('plinko-board');
const ctx = canvas.getContext('2d');

// Game Config
const ROWS = 12;
const PEG_RADIUS = 3;
const BALL_RADIUS = 5;
const GRAVITY = 0.4; // Increased gravity
const FRICTION = 0.98; // Air resistance
const BOUNCE = 0.5; // Dampen bounce

// State
let bankroll = 23000000.00;
let balance = 0.00;
let balls = [];
let pegs = [];
let buckets = [];
let width, height;

// Multipliers (13 items)
const MULTIPLIERS = [100, 10, 5, 2, 0.2, 0.1, 0.1, 0.1, 0.2, 2, 5, 10, 100];
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
    
    // Calculate sizing to fit screen vertically and horizontally
    const padding = 20;
    const startY = 80;
    const bucketsHeight = 50;
    
    // Max available height for the board content
    const availableH = height - startY - bucketsHeight - padding;
    // Spacing based on height (ROWS + 1 spaces needed roughly)
    const spacingH = availableH / (ROWS + 2);
    
    // Spacing based on width
    const availableW = width - (padding * 2);
    const spacingW = availableW / (ROWS + 1); // Approximate width needs
    
    // Use the smaller spacing to ensure fit
    const spacing = Math.min(spacingH, spacingW);
    
    // Recalculate startY to center vertically if we have extra space? 
    // Or just stick to top
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c <= r; c++) {
            // Center the row
            const x = (width / 2) - ((r * spacing) / 2) + (c * spacing);
            const y = startY + (r * spacing);
            pegs.push({ x, y });
        }
    }
    
    const finalRowY = startY + ((ROWS - 1) * spacing);
    const bucketY = finalRowY + spacing; // Where buckets are
    
    const lastRowWidth = (ROWS - 1) * spacing;
    const startX = (width / 2) - (lastRowWidth / 2); // Center of first peg of last row
    
    for(let i=0; i < ROWS + 1; i++) {
        const cx = startX - (spacing/2) + (i * spacing);
        const cy = bucketY;
        const w = spacing - 2;
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

let particles = [];

// Game Loop
function loop() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        
        if (p.life <= 0 || p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }
        
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    // Draw Pegs
    ctx.fillStyle = '#fff';
    pegs.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PEG_RADIUS, 0, Math.PI*2);
        ctx.fill();
        // Glow
        ctx.shadowBlur = 5;
        ctx.shadowColor = "#00d2ff";
        ctx.fill();
        ctx.shadowBlur = 0;
    });
    
    // Draw Buckets
    buckets.forEach(b => {
        ctx.fillStyle = b.color;
        // Rounded rect for style
        // ctx.fillRect(b.x - b.w/2, b.y, b.w, b.h);
        roundRect(ctx, b.x - b.w/2, b.y, b.w, b.h, 5, true, false);
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 11px Inter, sans-serif';
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
                const nx = dx / dist;
                const ny = dy / dist;
                const jitter = (Math.random() - 0.5) * 1.5;
                
                // Bias towards center if hitting outer pegs
                let centerBias = 0;
                if (b.x < width * 0.3) centerBias = 0.5; // Push right
                if (b.x > width * 0.7) centerBias = -0.5; // Push left

                b.vx += nx * 2 + jitter + centerBias;
                b.vy *= -BOUNCE;
                
                const overlap = (BALL_RADIUS + PEG_RADIUS) - dist;
                b.x += nx * overlap;
                b.y += ny * overlap;
                
                // Spawn particles on hit
                spawnParticles(p.x, p.y, 3, '#fff');
            }
        });
        
        // Wall Bounce (Keep balls in play)
        if (b.x < BALL_RADIUS) {
            b.x = BALL_RADIUS;
            b.vx *= -0.8;
        } else if (b.x > width - BALL_RADIUS) {
            b.x = width - BALL_RADIUS;
            b.vx *= -0.8;
        }

        // Draw Ball
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_RADIUS, 0, Math.PI*2);
        ctx.fillStyle = '#00d2ff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00d2ff';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Bucket Collision
        if (b.y > buckets[0].y) {
            const landedBucket = buckets.find(bucket => Math.abs(b.x - bucket.x) < bucket.w/2 + 5);
            
            if (landedBucket) {
                resolveBall(b, landedBucket);
                balls.splice(i, 1);
                // Big splash
                spawnParticles(b.x, b.y, 20, landedBucket.color);
            } else if (b.y > height + 50) {
                 balls.splice(i, 1);
            }
        }
    }
    
    requestAnimationFrame(loop);
}

function spawnParticles(x, y, count, color) {
    for(let i=0; i<count; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 30 + Math.random() * 20,
            alpha: 1.0,
            color: color,
            radius: Math.random() * 2 + 1
        });
    }
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
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
