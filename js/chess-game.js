// PLINKOVERSE 3D CHESS ENGINE
// Powered by Three.js & Chess.js

const container = document.getElementById('canvas-wrapper');
let scene, camera, renderer, controls;
let boardGroup, piecesGroup;
const pieces = {}; // Map square (e.g., "e4") to mesh
const game = new Chess();
let selectedPiece = null;
let validMoves = [];
let raycaster, mouse;
let isDragging = false;
let hoverHighlight;

// Config
const SQUARE_SIZE = 10;
const BOARD_SIZE = SQUARE_SIZE * 8;
const COLORS = {
    white: 0xeeeeee,
    black: 0x111111,
    whitePiece: 0xffffff,
    blackPiece: 0x222222,
    highlight: 0x00d2ff,
    valid: 0x00ff00,
    capture: 0xff0000
};

// Init
init();
animate();

function init() {
    // 1. Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000510, 0.005);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 80, 80);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const spot = new THREE.SpotLight(0xffffff, 1);
    spot.position.set(50, 100, 50);
    spot.castShadow = true;
    spot.shadow.mapSize.width = 2048;
    spot.shadow.mapSize.height = 2048;
    scene.add(spot);

    // Blue accent light
    const point = new THREE.PointLight(0x00d2ff, 0.5);
    point.position.set(-50, 20, -50);
    scene.add(point);

    // 5. Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below board

    // 6. Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 7. Objects
    createBoard();
    createPieces();
    createHighlights();

    // 8. Events
    window.addEventListener('resize', onResize);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // 9. Hide loader
    document.getElementById('loading-overlay').style.display = 'none';

    // 10. Load State?
    loadGameState();
}

function createBoard() {
    boardGroup = new THREE.Group();
    
    // Board Base (The "2nd Dimension" high def board)
    const geometry = new THREE.PlaneGeometry(BOARD_SIZE, BOARD_SIZE);
    
    // Procedural Grid Texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const s = 1024 / 8;
    
    // Draw Checkerboard
    for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
            ctx.fillStyle = (r+c)%2 === 0 ? '#e0e0e0' : '#2a2a2a';
            ctx.fillRect(c*s, r*s, s, s);
            
            // Add "High Def" noise/texture details
            ctx.fillStyle = (r+c)%2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)';
            ctx.fillRect(c*s + 5, r*s + 5, s - 10, s - 10);
        }
    }
    
    // Add Borders/Coordinates
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 5;
    ctx.strokeRect(0,0,1024,1024);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;

    const material = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.2,
        metalness: 0.1
    });

    const board = new THREE.Mesh(geometry, material);
    board.rotation.x = -Math.PI / 2;
    board.receiveShadow = true;
    boardGroup.add(board);

    // Glow under board
    const glowGeo = new THREE.PlaneGeometry(BOARD_SIZE + 4, BOARD_SIZE + 4);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, opacity: 0.2, transparent: true });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.1;
    boardGroup.add(glow);

    scene.add(boardGroup);
}

function createPieces() {
    if (piecesGroup) scene.remove(piecesGroup);
    piecesGroup = new THREE.Group();
    scene.add(piecesGroup);

    // Sync with chess.js board
    const boardState = game.board(); // 8x8 array

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = boardState[r][c];
            if (piece) {
                const mesh = createPieceMesh(piece.type, piece.color);
                
                // Position (Chess coords: a8 is 0,0 top-left)
                // Three coords: 0,0 is center
                const x = (c - 3.5) * SQUARE_SIZE;
                const z = (r - 3.5) * SQUARE_SIZE;
                
                mesh.position.set(x, 0, z);
                mesh.userData = { square: coordsToSan(r, c), type: piece.type, color: piece.color };
                
                piecesGroup.add(mesh);
                pieces[coordsToSan(r, c)] = mesh;
            }
        }
    }
}

// Helper: Abstract Piece Generator
function createPieceMesh(type, color) {
    const isWhite = color === 'w';
    const matColor = isWhite ? COLORS.whitePiece : COLORS.blackPiece;
    
    // Enthusiastic Material
    const material = new THREE.MeshStandardMaterial({
        color: matColor,
        roughness: 0.1,
        metalness: 0.5,
        emissive: isWhite ? 0x111111 : 0x220000,
        emissiveIntensity: 0.2
    });

    let geometry;
    let meshGroup = new THREE.Group();
    let body;

    // Base
    const baseGeo = new THREE.CylinderGeometry(3, 3.5, 1, 32);
    const base = new THREE.Mesh(baseGeo, material);
    base.position.y = 0.5;
    base.castShadow = true;
    base.receiveShadow = true;
    meshGroup.add(base);

    switch (type) {
        case 'p': // Pawn: Sphere on Cone
            const pBody = new THREE.Mesh(new THREE.ConeGeometry(2, 6, 16), material);
            pBody.position.y = 4;
            const pHead = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 16), material);
            pHead.position.y = 7;
            meshGroup.add(pBody, pHead);
            break;
        case 'r': // Rook: Castle Tower
            const rBody = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 6, 8), material);
            rBody.position.y = 4;
            const rTop = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 2, 8), material);
            rTop.position.y = 8;
            meshGroup.add(rBody, rTop);
            break;
        case 'n': // Knight: L-shape / Horse head abstract
            const nBody = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.5, 5, 16), material);
            nBody.position.y = 3.5;
            const nHead = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 4), material);
            nHead.position.y = 7;
            nHead.rotation.x = -Math.PI / 4;
            meshGroup.add(nBody, nHead);
            break;
        case 'b': // Bishop: Mitre
            const bBody = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.5, 7, 16), material);
            bBody.position.y = 4.5;
            const bHead = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.5, 8, 16), material);
            bHead.rotation.x = Math.PI / 2;
            bHead.position.y = 8.5;
            meshGroup.add(bBody, bHead);
            break;
        case 'q': // Queen: Crown
            const qBody = new THREE.Mesh(new THREE.CylinderGeometry(2, 3, 9, 32), material);
            qBody.position.y = 5.5;
            const qCrown = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, 0.2, 32, 8), material);
            qCrown.position.y = 10.5;
            qCrown.rotation.x = Math.PI/2;
            meshGroup.add(qBody, qCrown);
            break;
        case 'k': // King: Cross
            const kBody = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3, 10, 32), material);
            kBody.position.y = 6;
            const kCrossV = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 1), material);
            kCrossV.position.y = 12;
            const kCrossH = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 1), material);
            kCrossH.position.y = 11.5;
            meshGroup.add(kBody, kCrossV, kCrossH);
            break;
    }

    return meshGroup;
}

function createHighlights() {
    // Square Highlight (Hover)
    const geo = new THREE.PlaneGeometry(SQUARE_SIZE, SQUARE_SIZE);
    const mat = new THREE.MeshBasicMaterial({ color: COLORS.highlight, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    hoverHighlight = new THREE.Mesh(geo, mat);
    hoverHighlight.rotation.x = -Math.PI / 2;
    hoverHighlight.visible = false;
    scene.add(hoverHighlight);
}

// Interaction
function onMouseMove(event) {
    // Normalize mouse
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(boardGroup.children);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        // Snap to grid
        const x = Math.floor((point.x + (BOARD_SIZE/2)) / SQUARE_SIZE);
        const z = Math.floor((point.z + (BOARD_SIZE/2)) / SQUARE_SIZE);
        
        if (x >= 0 && x < 8 && z >= 0 && z < 8) {
            hoverHighlight.position.set(
                (x - 3.5) * SQUARE_SIZE,
                0.1,
                (z - 3.5) * SQUARE_SIZE
            );
            hoverHighlight.visible = true;
            return;
        }
    }
    hoverHighlight.visible = false;
}

function onClick(event) {
    if (!hoverHighlight.visible) return;

    // Convert world pos back to SAN (e.g. "e4")
    // Grid: x=0 -> a, x=7 -> h
    // z=0 -> 8 (top), z=7 -> 1 (bottom) in our visual logic?
    // Let's re-verify coordsToSan logic.
    // In Loop: x = (c - 3.5) * SQUARE.
    // c=0 -> x = -3.5. 
    // Hover: x index 0..7
    // So c = x_index.
    
    const xIdx = Math.round((hoverHighlight.position.x / SQUARE_SIZE) + 3.5);
    const zIdx = Math.round((hoverHighlight.position.z / SQUARE_SIZE) + 3.5);
    
    const square = coordsToSan(zIdx, xIdx); // Row, Col
    
    handleClick(square);
}

function handleClick(square) {
    // 1. Select Piece
    const piece = game.get(square);
    
    if (selectedPiece === null) {
        // Try to select
        if (piece && piece.color === game.turn()) {
            selectedPiece = square;
            highlightSquare(square, COLORS.valid);
            showValidMoves(square);
            log(`Selected ${square}`);
        }
    } else {
        // Try to Move
        const move = game.move({
            from: selectedPiece,
            to: square,
            promotion: 'q' // Auto promote to queen for simplicity
        });

        if (move) {
            // Valid Move!
            updateBoardVisuals();
            log(`Move: ${move.san}`);
            saveGameState();
            
            // AI Move if Playing Black? (Optional, user said PVP)
            // For now, PVP only.
            
        } else {
            // Invalid, deselect or select new
            if (piece && piece.color === game.turn()) {
                selectedPiece = square;
                showValidMoves(square);
            } else {
                selectedPiece = null;
                // clear highlights
            }
        }
    }
    updateStatus();
}

function coordsToSan(row, col) {
    // chess.js: row 0 is rank 8, row 7 is rank 1
    // col 0 is a, col 7 is h
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return files[col] + ranks[row];
}

function updateBoardVisuals() {
    createPieces(); // Brute force redraw is safest for 3D state sync
}

function showValidMoves(square) {
    // Highlight possible moves
    const moves = game.moves({ square: square, verbose: true });
    // TODO: Add visual dots for valid moves
}

function highlightSquare(square, color) {
    // Visual feedback
}

function updateStatus() {
    const statusEl = document.getElementById('game-status');
    const turnEl = document.getElementById('turn-indicator');
    
    let status = 'ACTIVE';
    if (game.in_checkmate()) status = 'CHECKMATE';
    else if (game.in_draw()) status = 'DRAW';
    
    statusEl.innerText = status;
    turnEl.innerText = game.turn() === 'w' ? 'WHITE TO MOVE' : 'BLACK TO MOVE';
}

function log(msg) {
    const logEl = document.getElementById('move-history');
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerText = `> ${msg}`;
    logEl.prepend(div);
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// "Multiplayer" Simulation
function saveGameState() {
    localStorage.setItem('plink_chess_fen', game.fen());
}

function loadGameState() {
    const fen = localStorage.getItem('plink_chess_fen');
    if (fen) {
        game.load(fen);
        updateBoardVisuals();
        updateStatus();
    }
}

// Listen for updates from other tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'plink_chess_fen') {
        loadGameState();
    }
});
