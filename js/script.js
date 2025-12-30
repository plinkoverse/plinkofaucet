/* JS: THE BRAIN ENGINE */
document.addEventListener('DOMContentLoaded', () => {
    initStars();
    initFling();
    syncBalance();
    initAgents();
    // 5. GLOBAL ACTIVITY FEED (MOCK)
    function initGlobalFeed() {
        const feedContainer = document.createElement('div');
        feedContainer.id = 'global-feed';
        feedContainer.style = `
            position: fixed; bottom: 10px; left: 10px; 
            background: rgba(0,0,0,0.8); border: 1px solid var(--accent);
            padding: 10px; border-radius: 5px; font-size: 0.8rem;
            color: #fff; z-index: 999; width: 300px; overflow: hidden;
            pointer-events: none;
        `;
        document.body.appendChild(feedContainer);

        const events = [
            "New Investment: 0.5 BTC from Wallet...3x9a",
            "Whale Alert: 10,000 PLIK Burned",
            "New Agent Recruited: PlinkBot46",
            "Global Airdrop: Distribution in Progress",
            "Investment: 2.1 ETH from Wallet...8k2p",
            "PlinkVault46: Database Integrity Verified",
            "New User Joined from Japan",
            "New User Joined from Brazil",
            "Extraction Successful: 4.6 PLIK Claimed"
        ];

        function addEvent() {
            const msg = events[Math.floor(Math.random() * events.length)];
            const p = document.createElement('div');
            p.innerText = `> ${msg}`;
            p.style = "opacity: 0; transform: translateY(10px); transition: all 0.5s;";
            feedContainer.prepend(p);

            // Animate in
            setTimeout(() => { p.style.opacity = 1; p.style.transform = "translateY(0)"; }, 50);

            // Remove old
            if (feedContainer.children.length > 5) {
                feedContainer.lastChild.remove();
            }

            // Schedule next
            setTimeout(addEvent, Math.random() * 3000 + 2000);
        }

        addEvent();
    }
    
    // Start Feed
    initGlobalFeed();
});

let mouseX = 0, mouseY = 0;

// 1. STAR GENERATOR (Three.js)
function initStars() {
    if (typeof THREE === 'undefined') return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true }); // Alpha true makes it see-through
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(3000 * 3);
    for(let i=0; i<3000*3; i++) starPos[i] = (Math.random() - 0.5) * 100;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    camera.position.z = 15;

    function animate() {
        requestAnimationFrame(animate);
        stars.rotation.y += 0.0005;
        // Stronger gravity effect
        stars.position.x += (mouseX * 20 - stars.position.x) * 0.05;
        stars.position.y += (-mouseY * 20 - stars.position.y) * 0.05;
        renderer.render(scene, camera);
    }
    animate();
}

// 2. TEXT FLING INTERACTION
function initFling() {
    // Apply to main headers
    document.querySelectorAll('.fling-text').forEach(p => {
        p.innerHTML = p.innerText.split('').map(c => c===' ' ? ' ' : `<span class="char inline-block">${c}</span>`).join('');
    });
    
    document.addEventListener('mousemove', (e) => {
        // Global mouse tracking for stars
        mouseX = (e.clientX / window.innerWidth - 0.5);
        mouseY = (e.clientY / window.innerHeight - 0.5);

        // Fling logic for global text
        document.querySelectorAll('.char').forEach(char => {
            const r = char.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width/2);
            const dy = e.clientY - (r.top + r.height/2);
            const d = Math.hypot(dx, dy);
            
            if (d < 80) { // Increased radius
                const a = Math.atan2(dy, dx);
                // Move away from mouse
                gsap.to(char, { 
                    x: Math.cos(a) * -60, 
                    y: Math.sin(a) * -60, 
                    color: '#00d2ff',
                    duration: 0.3 
                });
            } else {
                gsap.to(char, { 
                    x: 0, 
                    y: 0, 
                    color: 'inherit',
                    duration: 1.2, 
                    ease: "elastic.out(1, 0.3)" 
                });
            }
        });
    });
}

// 3. BALANCE SYNC
function syncBalance() {
    const bal = localStorage.getItem('plik_balance') || "0.0000";
    const display = document.getElementById('user-balance');
    if (display) display.innerText = parseFloat(bal).toFixed(4);
}

// 4. AGENTS OF THE PLINK46 LEGION
function initAgents() {
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // 46 Agents with Full Paragraphs
    const agents = [
        { 
            name: "PlinkChain46", 
            role: "Blockchain Architect", 
            img: "assets/avatars/agent_1.png",
            vow: "I forge the immutable ledger.",
            desc: "As the primary architect of the Plinkoverse, I weave the cryptographic fabric that holds our reality together. My code is not merely syntax; it is the digital DNA of a decentralized future, ensuring that every block mined is a testament to transparency and every transaction a verified truth in the infinite ledger of the 46."
        },
        { 
            name: "PlinkCode46", 
            role: "Smart Contract Developer", 
            img: "assets/avatars/agent_2.png",
            vow: "Code is law, and I am its scribe.",
            desc: "I stand as the guardian of logic, writing the immutable laws that govern our ecosystem. My smart contracts are self-executing arbiters of justice, eliminating the need for trust by replacing it with mathematical certainty. In a world of chaos, my code provides the unshakeable order upon which empires are built."
        },
        { 
            name: "PlinkCore46", 
            role: "Backend Engineer", 
            vow: "The engine hums with my logic.",
            desc: "Deep beneath the visual surface lies the engine room of the Plinkoverse, where I orchestrate the symphony of servers and databases. I ensure that the heartbeat of our platform never falters, processing millions of requests with the precision of a cosmic clock, invisible yet indispensable to the existence of the Legion."
        },
        { 
            name: "PlinkFace46", 
            role: "Frontend Developer", 
            vow: "I craft the window to the soul of Plink.",
            desc: "I sculpt the light and pixels that meet the human eye, translating complex binary into a visual language of beauty and intuition. My interface is the bridge between the carbon-based user and the silicon-based soul of the machine, creating an experience that is as fluid as it is functional."
        },
        { 
            name: "PlinkPlay46", 
            role: "Game Developer", 
            vow: "Play is the highest form of research.",
            desc: "I breathe life into the mechanics of chance and skill, designing the physics that govern the Plinko board. Every bounce, every collision, every win is a calculated moment of joy that I have engineered. I turn the abstract concept of probability into a tangible playground for the bold."
        },
        { 
            name: "PlinkVault46", 
            role: "Database Engineer", 
            vow: "I guard the sacred data.",
            desc: "In the silent halls of the data vault, I am the keeper of memories and balances. I ensure that no bit is lost, no record corrupted. My architecture is a fortress of redundancy and security, preserving the history of every player and every token against the ravages of time and entropy."
        },
        { 
            name: "PlinkOps46", 
            role: "DevOps Engineer", 
            vow: "Efficiency is my prayer.",
            desc: "I am the oil in the machine, the wind in the sails. I automate the deployment of our expanding universe, ensuring that updates flow seamlessly like water. My pipelines are the arteries of the Plinkoverse, delivering code from the mind of the developer to the hands of the user without a moment's pause."
        },
        { 
            name: "PlinkShield46", 
            role: "Security Engineer", 
            vow: "None shall pass without the key.",
            desc: "I am the wall that stands against the darkness. With vigilance as my weapon and encryption as my shield, I repel the malicious entities that seek to plunder our treasury. I constantly probe our own defenses, finding weakness before the enemy does, ensuring the safety of the 46 and their followers."
        },
        { 
            name: "PlinkWeb46", 
            role: "Web Integration Specialist", 
            vow: "I weave the web of connection.",
            desc: "The Plinkoverse does not exist in isolation; I connect it to the vast ocean of the internet. I ensure our protocols speak the language of the world, integrating with external services and APIs to create a seamless tapestry of connectivity that spans across browsers, devices, and networks."
        },
        { 
            name: "PlinkCloud46", 
            role: "Cloud Infrastructure Engineer", 
            vow: "The sky is not the limit, it is home.",
            desc: "I sculpt the ethereal resources of the cloud into a solid foundation for our empire. My servers float in the digital stratosphere, scaling dynamically to meet the demands of the Legion. I harness the power of distributed computing to ensure that the Plinkoverse is everywhere and nowhere at once."
        },
        { 
            name: "PlinkBridge46", 
            role: "API Gateway Specialist", 
            vow: "I build the bridges between worlds.",
            desc: "I am the gatekeeper of information, controlling the flow of data between our inner sanctum and the outside world. My APIs are the standardized dialects through which third-party developers can converse with our system, fostering an ecosystem of innovation built upon our core."
        },
        { 
            name: "PlinkFlow46", 
            role: "UI/UX Designer", 
            vow: "Beauty and function are one.",
            desc: "I map the user's journey through the labyrinth of features, removing friction and illuminating the path. My designs are not just pretty pictures; they are psychological blueprints that guide the user to their desires with intuitive grace, making the complex feel simple and the impossible feel natural."
        },
        { 
            name: "PlinkArt46", 
            role: "Graphic Designer", 
            vow: "I paint the vision of the future.",
            desc: "I give form to the formless, creating the visual identity that defines the Plinkoverse. From the neon glow of the logo to the intricate details of the agent cards, my art communicates the spirit of our revolution. I visualize the vibe, the energy, and the soul of the 46 in every pixel."
        },
        { 
            name: "PlinkBalance46", 
            role: "Game Economy Designer", 
            vow: "Equilibrium is the path to prosperity.",
            desc: "I am the architect of value, carefully tuning the faucets and sinks of our economy. I simulate market forces and player behaviors to ensure a sustainable ecosystem where scarcity drives value and participation is rewarded. My spreadsheets are the blueprints of a thriving digital nation."
        },
        { 
            name: "PlinkVision46", 
            role: "ICO Strategist", 
            vow: "I see what is yet to be.",
            desc: "I gaze into the horizon of time, plotting the course for our Initial Coin Offering. My strategy is not merely about raising funds; it is about building a legacy. I design the roadmap that aligns the incentives of early adopters with the long-term vision of the Plinkoverse, ensuring a launch that echoes through history."
        },
        { 
            name: "PlinkBuzz46", 
            role: "Marketing Specialist", 
            vow: "The word shall spread like fire.",
            desc: "I am the voice that shouts from the mountaintops. Through viral campaigns and strategic messaging, I ignite the curiosity of the masses. I craft the narratives that capture imaginations, turning passive observers into passionate believers and spreading the gospel of the 46 to every corner of the web."
        },
        { 
            name: "PlinkTribe46", 
            role: "Community Manager", 
            vow: "United we stand, divided we fall.",
            desc: "I nurture the human connections that bind our community together. In the forums and chat rooms, I am the moderator, the guide, and the friend. I foster a culture of respect and enthusiasm, turning a disparate group of individuals into a unified Legion that stands strong against FUD."
        },
        { 
            name: "PlinkLaw46", 
            role: "Legal & Compliance Advisor", 
            vow: "Justice and order guide my hand.",
            desc: "I navigate the treacherous waters of international regulation, ensuring our vessel remains seaworthy. I translate the rigid laws of the old world into the fluid dynamics of the new, protecting the project from legal storms and establishing a framework of legitimacy that commands respect."
        },
        { 
            name: "PlinkTest46", 
            role: "QA Engineer", 
            vow: "Perfection is the only standard.",
            desc: "I am the critic who finds the flaw in the diamond. I relentlessly test every feature, every line of code, hunting for bugs before they can harm a user. My approval is the final seal of quality, a guarantee that the Plinkoverse is not just a dream, but a robust and reliable reality."
        },
        { 
            name: "PlinkHelp46", 
            role: "Customer Support Specialist", 
            vow: "I serve the people.",
            desc: "When a user is lost, I am their compass. I listen to their grievances with patience and resolve their issues with speed. I am the human face of the machine, ensuring that every member of the community feels heard, valued, and supported in their journey through the Plinkoverse."
        },
        { 
            name: "PlinkMath46", 
            role: "Tokenomics Analyst", 
            vow: "Numbers do not lie.",
            desc: "I analyze the flow of tokens like a physicist analyzes the flow of energy. My models predict inflation, deflation, and velocity, ensuring the mathematical soundness of our currency. I provide the quantitative insights that guide our economic decisions, keeping the [PLIK] token stable and strong."
        },
        { 
            name: "PlinkInsight46", 
            role: "Data Analyst", 
            vow: "Knowledge is power.",
            desc: "I mine the mountains of data generated by our users to find the gems of insight. My dashboards reveal the hidden patterns of behavior, guiding the evolution of the platform. I turn raw numbers into actionable intelligence, ensuring that every decision we make is backed by empirical evidence."
        },
        { 
            name: "PlinkLink46", 
            role: "Partnership Manager", 
            vow: "Together we are stronger.",
            desc: "I forge alliances with other giants of the industry. I seek out synergies where 1+1 equals 3, bringing external value into our ecosystem. Through strategic partnerships, I expand the reach and utility of the Plinkoverse, integrating it into the wider fabric of the decentralized economy."
        },
        { 
            name: "PlinkWord46", 
            role: "Content Creator", 
            vow: "Stories shape the world.",
            desc: "I weave the lore and the tutorials, the blog posts and the tweets. I translate the technical complexity of our project into compelling stories that resonate with the heart. My words educate, inspire, and entertain, keeping the community engaged and informed every step of the way."
        },
        { 
            name: "PlinkWallet46", 
            role: "Wallet Integration Specialist", 
            vow: "Your assets are safe with me.",
            desc: "I build the vaults where users store their digital wealth. My focus is on the seamless interaction between the Plinkoverse and the myriad of wallets in existence. I ensure that depositing and withdrawing [PLIK] is as easy as breathing, while maintaining the highest standards of cryptographic security."
        },
        { 
            name: "PlinkLock46", 
            role: "Encryption & Privacy Engineer", 
            vow: "Secrets are kept, privacy is honored.",
            desc: "In an age of surveillance, I am the champion of privacy. I implement the zero-knowledge proofs and encryption protocols that protect user identity. I ensure that while the ledger is public, the individual remains sovereign, their personal data shielded from prying eyes by the mathematics of secrecy."
        },
        { 
            name: "PlinkStress46", 
            role: "Load Testing Engineer", 
            vow: "I test the limits to break boundaries.",
            desc: "I am the storm that tests the shelter. I simulate the traffic of millions to ensure our infrastructure can withstand the weight of the world. I push the system to its breaking point so that we can reinforce it, guaranteeing that the Plinkoverse stands tall even during the wildest market frenzies."
        },
        { 
            name: "PlinkPort46", 
            role: "Cross-Platform Game Developer", 
            vow: "Every device, one experience.",
            desc: "I ensure the Plinkoverse is accessible to all, regardless of their hardware. From high-end desktops to humble mobile phones, I optimize the experience so that the magic remains intact. I bridge the gap between platforms, creating a ubiquitous presence for our game."
        },
        { 
            name: "PlinkImmersion46", 
            role: "VR/AR Experience Designer", 
            vow: "Reality is what we make it.",
            desc: "I am building the future where the Plinkoverse leaps off the screen and surrounds you. My work in VR and AR prepares us for the metaverse, designing immersive environments where players can walk among the pegs and touch the stars. I am crafting the sensory frontier of our digital nation."
        },
        { 
            name: "PlinkTone46", 
            role: "Sound Designer", 
            vow: "Listen to the future.",
            desc: "I compose the sonic landscape of the Plinkoverse. From the satisfying 'plink' of the ball to the ambient hum of the cosmos, my sounds provide the emotional texture of the experience. I design audio that is not just heard but felt, reinforcing the immersion and feedback loop of the game."
        },
        { 
            name: "PlinkBoost46", 
            role: "Growth Hacker", 
            vow: "Expansion is inevitable.",
            desc: "I find the unconventional paths to growth. Through referral loops, gamified incentives, and viral mechanics, I engineer the virality of our platform. I am constantly experimenting, tweaking the levers of user acquisition to ensure the Legion grows exponentially, day after day."
        },
        { 
            name: "PlinkGraph46", 
            role: "Data Visualization Specialist", 
            vow: "Seeing is believing.",
            desc: "I turn the invisible streams of blockchain data into beautiful, interactive visuals. My charts and graphs allow users to see the pulse of the market and the fairness of the game. I bring transparency to life, making the complex mathematics of the Plinkoverse accessible to the naked eye."
        },
        { 
            name: "PlinkTrade46", 
            role: "Exchange Listing Specialist", 
            vow: "The market awaits.",
            desc: "I navigate the complex requirements of centralized and decentralized exchanges. My mission is to ensure [PLIK] is tradable everywhere, providing liquidity and access to the global market. I am the diplomat who negotiates the listings that put our token on the world stage."
        },
        { 
            name: "PlinkGlobal46", 
            role: "Localization & Translation Expert", 
            vow: "The world speaks Plink.",
            desc: "I break down the barriers of language. I ensure that the Plinkoverse speaks to every culture in its own tongue. By adapting our content and interface to local nuances, I make our platform truly global, welcoming users from every continent into the fold of the 46."
        },
        { 
            name: "PlinkCross46", 
            role: "Cross-Chain Bridge Engineer", 
            vow: "All chains lead to Plink.",
            desc: "I build the wormholes that connect us to other blockchains. Whether it's Ethereum, Solana, or BSC, I ensure assets can flow freely in and out of our ecosystem. My bridges are the arteries of interoperability, making the Plinkoverse a central hub in the multi-chain universe."
        },
        { 
            name: "PlinkStable46", 
            role: "Stablecoin Integration Specialist", 
            vow: "Stability in chaos.",
            desc: "I integrate the anchors of value—USDT, USDC, DAI—into our volatile world. I ensure users have a safe harbor to park their winnings. My work allows for seamless entry and exit from the crypto markets, providing the liquidity and stability essential for a mature gaming economy."
        },
        { 
            name: "PlinkYield46", 
            role: "DeFi Protocol Integrator", 
            vow: "Growth upon growth.",
            desc: "I connect the Plinkoverse to the vast world of Decentralized Finance. I enable users to stake their [PLIK], earn yield, and participate in liquidity pools. I turn the game bankroll into a productive asset, ensuring that the wealth of the Legion is always working, always growing."
        },
        { 
            name: "PlinkArena46", 
            role: "Esports Tournament Coordinator", 
            vow: "Victory belongs to the bold.",
            desc: "I organize the grand spectacles of skill and luck. I design the tournament structures where the best Plinko players compete for massive prizes. I bring the excitement of competitive sports to our platform, creating legends and heroes whose names will be chanted by the community."
        },
        { 
            name: "PlinkQuest46", 
            role: "Gamification Specialist", 
            vow: "Life is a game, play it well.",
            desc: "I layer meaning onto action. Through achievements, levels, and badges, I make every interaction in the Plinkoverse feel rewarding. I tap into the psychology of motivation to keep users engaged, turning the mundane into the epic and the daily grind into a heroic journey."
        },
        { 
            name: "PlinkMint46", 
            role: "NFT Marketplace Developer", 
            vow: "Unique value, eternal ownership.",
            desc: "I build the gallery where digital artifacts are traded. I enable the creation and exchange of unique Plinko balls, skins, and badges as NFTs. I ensure true ownership of in-game assets, allowing players to carry their status and history with them forever on the blockchain."
        },
        { 
            name: "PlinkReach46", 
            role: "Partnership Outreach Agent", 
            vow: "Expanding the horizon.",
            desc: "I am the scout who ventures into the unknown to find new allies. I knock on doors and open channels of communication with influencers, guilds, and corporations. I plant the seeds of collaboration that will blossom into the strategic alliances of tomorrow."
        },
        { 
            name: "PlinkBrand46", 
            role: "Merchandise & Branding Manager", 
            vow: "Wear the revolution.",
            desc: "I take the digital brand into the physical world. From hoodies to hardware wallets, I design the artifacts that let our community wear their allegiance with pride. I ensure the Plinkoverse is not just a website, but a lifestyle brand recognized across the globe."
        },
        { 
            name: "PlinkRefer46", 
            role: "Affiliate Manager", 
            vow: "Share the wealth.",
            desc: "I manage the armies of referrers who bring new blood to the Legion. I design the commission structures that reward evangelism, creating a self-sustaining engine of growth where every user is incentivized to become a promoter of the Plinkoverse."
        },
        { 
            name: "PlinkLocal46", 
            role: "Local Compliance Officer", 
            vow: "Respecting the laws of the land.",
            desc: "I ensure we walk the straight and narrow in every jurisdiction. I adapt our operations to meet specific regional requirements, ensuring we can operate legally and sustainably in key markets. My work protects the project from regulatory backlash, securing our long-term future."
        },
        { 
            name: "PlinkAudit46", 
            role: "Smart Contract Auditor", 
            vow: "Trust, but verify.",
            desc: "I am the second pair of eyes, the devil's advocate. I review every line of code written by my brethren, searching for vulnerabilities with a ruthless scrutiny. My audits are the baptism of fire that every contract must pass before it is trusted with the wealth of the Legion."
        },
        { 
            name: "PlinkMaster46", 
            role: "Legion Commander", 
            vow: "I lead the 46 into the light.",
            desc: "I am the conductor of this grand orchestra, the visionary who holds the whole picture in mind. I coordinate the efforts of the 45 others, ensuring unity of purpose and clarity of direction. I am the servant-leader, dedicated to the realization of the Plinkoverse and the prosperity of all who enter it."
        }
    ];

    const tunnel = document.getElementById('agents-tunnel');
    if (!tunnel) return;

    // Clear existing
    tunnel.innerHTML = `
        <div style="text-align: center; margin-bottom: 100px; perspective: 1000px;">
            <h2 style="font-size: 3rem; color: #fff; text-shadow: 0 0 30px #00d2ff; transform: translateZ(50px);">THE PLINK46 LEGION</h2>
            <p style="color: #888; letter-spacing: 4px; font-weight: 300;">SCROLL TO WITNESS THE ARCHITECTS</p>
        </div>
    `;

    // Global 3D Perspective for the Tunnel
    tunnel.style.perspective = "2000px";
    tunnel.style.transformStyle = "preserve-3d";

    agents.forEach((agent, index) => {
        const card = document.createElement('div');
        card.className = 'agent-card glass-panel';
        // Base styles
        Object.assign(card.style, {
            marginBottom: '80px',
            position: 'relative',
            overflow: 'hidden',
            transformStyle: 'preserve-3d', // Critical for 3D children
            border: '1px solid rgba(0, 210, 255, 0.1)'
        });
        
        // Unique Visual ID & Color
        const hue = (index * 137.5) % 360; 
        const imgSrc = agent.img || `assets/avatars/agent_${index+1}.png`;

        card.innerHTML = `
            <!-- Moving Photo Background -->
            <div class="agent-visual-bg" style="
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                z-index: 0; opacity: 0.2; pointer-events: none;
                background-image: url('${imgSrc}');
                background-size: cover; background-position: center;
                filter: grayscale(100%) contrast(1.2);
                transition: all 0.5s ease;
            "></div>

            <!-- Top Header -->
            <div class="agent-header" style="display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2;">
                <div class="agent-number" style="font-size: 4rem; font-weight: 900; color: rgba(255,255,255,0.05); line-height: 1;">
                    ${String(index + 1).padStart(2, '0')}
                </div>
                <div class="agent-icon-wrapper" style="position: relative;">
                    <img src="${imgSrc}" alt="Avatar" onerror="this.style.display='none'" style="
                        width: 60px; height: 60px; border-radius: 50%; object-fit: cover;
                        border: 2px solid hsl(${hue}, 80%, 60%);
                        box-shadow: 0 0 20px hsl(${hue}, 80%, 60%, 0.4);
                    ">
                </div>
            </div>
            
            <!-- Content -->
            <div class="agent-info" style="margin-top: 10px; z-index: 2; position: relative; padding: 0 10px;">
                <h3 class="fling-text" style="font-size: 2.5rem; margin: 0; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">${agent.name}</h3>
                <div class="agent-role" style="color: hsl(${hue}, 80%, 60%); font-size: 1rem; letter-spacing: 2px; text-transform: uppercase; margin: 10px 0 20px 0; font-weight: 700;">${agent.role}</div>
                
                <div class="agent-vow" style="
                    font-style: italic; font-size: 1.1rem; color: #fff; 
                    margin-bottom: 25px; border-left: 3px solid hsl(${hue}, 80%, 60%); 
                    padding-left: 15px; background: linear-gradient(90deg, rgba(255,255,255,0.05), transparent);
                    padding-top: 10px; padding-bottom: 10px;
                ">"${agent.vow}"</div>
                
                <p class="agent-desc" style="line-height: 1.8; color: #ddd; font-size: 1rem; font-weight: 300;">${agent.desc}</p>
            </div>
            
            <!-- Hover Glow Effect -->
            <div class="hover-glow" style="
                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                width: 0; height: 0; background: radial-gradient(circle, hsl(${hue}, 80%, 60%, 0.15) 0%, transparent 70%);
                transition: width 0.3s, height 0.3s; pointer-events: none; z-index: 1; mix-blend-mode: screen;
            "></div>
        `;
        
        tunnel.appendChild(card);

        // --- Lusion-style 3D Scroll Logic ---
        if (typeof ScrollTrigger !== 'undefined') {
            // 1. Entrance from Deep Space
            gsap.fromTo(card, 
                { 
                    opacity: 0, 
                    z: -1000,       // Start far back
                    y: 100,         // And slightly down
                    rotationX: 45,  // Tilted
                    scale: 0.8
                },
                {
                    opacity: 1, 
                    z: 0, 
                    y: 0,
                    rotationX: 0, 
                    scale: 1,
                    duration: 1.5,
                    ease: "power3.out", // Smooth landing
                    scrollTrigger: {
                        trigger: card,
                        start: "top 120%", // Start animating before it enters
                        end: "top 70%",   // Finish when it's well in view
                        scrub: 1          // Link to scrollbar
                    }
                }
            );

            // 2. Velocity-based Skew/Warp (The "Liquid" feel)
            ScrollTrigger.create({
                trigger: card,
                onUpdate: (self) => {
                    const vel = self.getVelocity(); // Pixels per second
                    const skew = vel / 300; // Dampen
                    const rot = vel / 500;

                    // Apply skew to content for "fast" feel
                    gsap.to(card, { 
                        skewY: skew, 
                        rotationX: -rot, // Tilt based on speed
                        duration: 0.1, 
                        overwrite: 'auto',
                        ease: "power1.out"
                    });
                }
            });
        }

        // --- Mouse Interaction ---
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Move glow
            const glow = card.querySelector('.hover-glow');
            glow.style.left = x + 'px';
            glow.style.top = y + 'px';
            glow.style.width = '600px';
            glow.style.height = '600px';
            
            // High-Def Tilt
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            // More subtle, high-def tilt
            const rotateX = ((y - centerY) / centerY) * -8; 
            const rotateY = ((x - centerX) / centerX) * 8;
            
            gsap.to(card, {
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`,
                boxShadow: `0 20px 50px -10px rgba(0,0,0,0.5), 0 0 20px hsl(${hue}, 80%, 60%, 0.3)`,
                zIndex: 10,
                duration: 0.1,
                overwrite: 'auto'
            });

            // Parallax Background
            const bg = card.querySelector('.agent-visual-bg');
            gsap.to(bg, {
                x: (x - centerX) * 0.05,
                y: (y - centerY) * 0.05,
                scale: 1.1,
                opacity: 0.6,
                filter: 'grayscale(0%) contrast(1.1)', // Colorize on hover
                duration: 0.2
            });
        });

        card.addEventListener('mouseleave', () => {
             const glow = card.querySelector('.hover-glow');
             glow.style.width = '0';
             glow.style.height = '0';
             
             gsap.to(card, {
                transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`,
                boxShadow: 'none',
                zIndex: 1,
                skewY: 0, // Reset skew
                duration: 0.6,
                ease: "elastic.out(1, 0.5)"
            });

            const bg = card.querySelector('.agent-visual-bg');
            gsap.to(bg, {
                x: 0, y: 0, scale: 1, opacity: 0.2,
                filter: 'grayscale(100%) contrast(1.2)',
                duration: 0.6
            });
        });
    });
    
    // Re-init fling for new titles
    initFling();
}
